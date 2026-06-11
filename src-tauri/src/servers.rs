use gamedig::{query_with_timeout, TimeoutSettings, GAMES};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::IpAddr;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

/// A server entry as defined in the remote launcher config.json
#[derive(Debug, Deserialize, Clone)]
pub struct ServerConfig {
    pub name: Option<String>,
    pub ip: Option<String>,
    pub port: Option<String>,
    #[serde(rename = "queryPort")]
    pub query_port: Option<String>,
    #[serde(rename = "type")]
    pub server_type: String,
    pub protocol: String,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServerStatus {
    pub config_key: String,
    pub name: String,
    pub ip: Option<String>,
    pub port: Option<String>,
    pub protocol: String,
    pub online: bool,
    pub players: u32,
    pub max_players: u32,
    pub map: String,
    pub ping: u32,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServerUpdatePayload {
    pub game_type: String,
    pub server: ServerStatus,
}

fn config_key(server: &ServerConfig) -> String {
    match &server.name {
        Some(name) => name.clone(),
        None => format!(
            "{}:{}",
            server.ip.clone().unwrap_or_default(),
            server.port.clone().unwrap_or_default()
        ),
    }
}

fn offline_status(server: &ServerConfig, max_players: u32) -> ServerStatus {
    ServerStatus {
        config_key: config_key(server),
        name: server
            .name
            .clone()
            .unwrap_or_else(|| "Serveur hors ligne".to_string()),
        ip: server.ip.clone(),
        port: server.port.clone(),
        protocol: server.protocol.clone(),
        online: false,
        players: 0,
        max_players,
        map: "N/A".to_string(),
        ping: 0,
    }
}

/// Blocking GameDig query, run inside spawn_blocking
fn query_gamedig(server: &ServerConfig, timeout_secs: u64) -> ServerStatus {
    let fallback = offline_status(server, 100);

    let Some(game) = GAMES.get(server.server_type.as_str()) else {
        return fallback;
    };

    let Some(ip) = server
        .ip
        .as_ref()
        .and_then(|ip| ip.parse::<IpAddr>().ok())
    else {
        return fallback;
    };

    let port = server
        .query_port
        .as_ref()
        .or(server.port.as_ref())
        .and_then(|p| p.parse::<u16>().ok());

    let timeout = TimeoutSettings::new(
        Some(Duration::from_secs(timeout_secs)),
        Some(Duration::from_secs(timeout_secs)),
        Some(Duration::from_secs(timeout_secs)),
        0,
    )
    .ok();

    match query_with_timeout(game, &ip, port, timeout) {
        Ok(response) => {
            let json = response.as_json();
            ServerStatus {
                config_key: config_key(server),
                name: json
                    .name
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| fallback.name.clone()),
                ip: server.ip.clone(),
                port: server.port.clone(),
                protocol: server.protocol.clone(),
                online: true,
                players: json.players_online,
                max_players: json.players_maximum,
                map: json
                    .map
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| "Inconnu".to_string()),
                ping: 0,
            }
        }
        Err(_) => fallback,
    }
}

#[derive(Debug, Deserialize)]
#[allow(non_snake_case)]
struct BattleBitServer {
    Name: String,
    Players: u32,
    MaxPlayers: u32,
    Map: String,
}

const BATTLEBIT_API: &str = "https://publicapi.battlebit.cloud/Servers/GetServerList";
const USER_AGENT: &str = "Royal-Multi-Gamers-Launcher/2.0";

async fn query_battlebit(server: &ServerConfig, timeout_secs: u64) -> ServerStatus {
    let fallback = offline_status(server, 254);

    let client = match reqwest::Client::builder()
        .timeout(Duration::from_secs(timeout_secs))
        .user_agent(USER_AGENT)
        .build()
    {
        Ok(client) => client,
        Err(_) => return fallback,
    };

    let response = match client.get(BATTLEBIT_API).send().await {
        Ok(response) => response,
        Err(_) => return fallback,
    };

    let servers = match response.json::<Vec<BattleBitServer>>().await {
        Ok(servers) => servers,
        Err(_) => return fallback,
    };

    match servers
        .into_iter()
        .find(|s| Some(&s.Name) == server.name.as_ref())
    {
        Some(bb) => ServerStatus {
            config_key: config_key(server),
            name: bb.Name,
            ip: server.ip.clone(),
            port: server.port.clone(),
            protocol: server.protocol.clone(),
            online: true,
            players: bb.Players,
            max_players: bb.MaxPlayers,
            map: bb.Map,
            ping: 0,
        },
        None => fallback,
    }
}

async fn check_status(server: &ServerConfig, timeout_secs: u64) -> ServerStatus {
    if server.protocol == "battlebit" {
        query_battlebit(server, timeout_secs).await
    } else {
        let owned = server.clone();
        tauri::async_runtime::spawn_blocking(move || query_gamedig(&owned, timeout_secs))
            .await
            .unwrap_or_else(|_| offline_status(server, 100))
    }
}

async fn check_one(game_type: String, server: ServerConfig, is_initial_check: bool) -> ServerUpdatePayload {
    let mut status = check_status(&server, 4).await;

    if !status.online && is_initial_check {
        tokio::time::sleep(Duration::from_millis(500)).await;
        status = check_status(&server, 6).await;
    }

    ServerUpdatePayload {
        game_type,
        server: status,
    }
}

/// Streaming server status check: emits a `server-update` event per server
/// as soon as its result is ready, then a final `server-check-done` event.
#[tauri::command]
pub async fn check_servers(
    app: AppHandle,
    servers: HashMap<String, Vec<ServerConfig>>,
    is_initial_check: bool,
) {
    let mut tasks = Vec::new();

    for (game_type, list) in servers {
        for server in list {
            let game_type = game_type.clone();
            tasks.push(tauri::async_runtime::spawn(async move {
                check_one(game_type, server, is_initial_check).await
            }));
        }
    }

    for task in tasks {
        if let Ok(payload) = task.await {
            let _ = app.emit("server-update", payload);
        }
    }

    let _ = app.emit("server-check-done", ());
}

/// Generic JSON/text fetch used for the remote config and news feeds.
#[tauri::command]
pub async fn fetch_json(url: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .user_agent(USER_AGENT)
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
    response.text().await.map_err(|e| e.to_string())
}
