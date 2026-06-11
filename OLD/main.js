const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const { GameDig } = require('gamedig');

// Configuration centralisée
const CONFIG = {
    window: {
        width: 1200, height: 800, minWidth: 1000, minHeight: 700,
        backgroundColor: '#1a1a1a', frame: false, show: false
    },
    timeouts: { 
        socket: 3000,        // Increased from 1500ms
        attempt: 4000,       // Increased from 2000ms
        socketRetry: 5000,   // Longer timeout for retries
        attemptRetry: 6000,  // Longer timeout for retries
        api: 5000            // Generic HTTP API timeout
    },
    protocols: {
        source: 'css', csgo: 'csgo', eco: 'eco'
    },
    urls: {
        steam: (ip, port) => `steam://connect/${ip}:${port}`,
        battlebit: 'steam://rungameid/671860/',
        eco: (ip, port) => `http://${ip}:${port}`,
        battlebitApi: 'https://publicapi.battlebit.cloud/Servers/GetServerList'
    }
};

let mainWindow;

// Disable GPU acceleration to prevent crashes
app.disableHardwareAcceleration();

function createWindow() {
    mainWindow = new BrowserWindow({
        ...CONFIG.window,
        webPreferences: {
            nodeIntegration: false, contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            backgroundThrottling: false, hardwareAcceleration: false
        },
        icon: path.join(__dirname, 'assets', 'icon.ico')
    });

    mainWindow.webContents.setBackgroundThrottling(false);
    mainWindow.loadFile('index.html');

    // Optimisation du chargement de fenêtre
    let loadStates = { load: false, dom: false };
    const showWindow = () => {
        if (loadStates.load && loadStates.dom) {
            setTimeout(() => {
                if (!mainWindow.isDestroyed()) {
                    mainWindow.show();
                    // Force a reflow without GPU acceleration
                    mainWindow.webContents.executeJavaScript('void(document.body.offsetHeight);');
                }
            }, 300);
        }
    };

    mainWindow.webContents.once('did-finish-load', () => { loadStates.load = true; showWindow(); });
    mainWindow.webContents.once('dom-ready', () => { loadStates.dom = true; showWindow(); });

    setupIPCHandlers();
}

function setupIPCHandlers() {
    // Contrôles de fenêtre optimisés
    const windowActions = {
        'window-minimize': () => mainWindow.minimize(),
        'window-maximize': () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(),
        'window-close': () => mainWindow.close(),
        'open-external': (_, url) => {
            const ALLOWED_PREFIXES = ['https://', 'http://', 'steam://'];
            if (typeof url !== 'string' || !ALLOWED_PREFIXES.some(p => url.startsWith(p))) {
                console.error(`Blocked unsafe external URL: ${String(url).substring(0, 100)}`);
                return;
            }
            shell.openExternal(url);
        }
    };

    Object.entries(windowActions).forEach(([event, handler]) => {
        ipcMain.handle(event, handler);
    });

    // Connexion serveur optimisée
    ipcMain.handle('connect-to-server', async (_, { ip, port, protocol }) => {
        try {
            if (protocol !== 'battlebit') {
                const gameType = CONFIG.protocols[protocol] || 'css';
                try {
                    await GameDig.query({
                        type: gameType, host: ip, port: parseInt(port),
                        maxAttempts: 1, socketTimeout: CONFIG.timeouts.socket, attemptTimeout: CONFIG.timeouts.attempt
                    });
                } catch (e) {
                    console.warn(`Server ${ip}:${port} may be offline, attempting connection anyway`);
                }
            }

            const url = protocol === 'battlebit' ? CONFIG.urls.battlebit :
                       protocol === 'eco' ? CONFIG.urls.eco(ip, port) :
                       CONFIG.urls.steam(ip, port);

            shell.openExternal(url);
            return { success: true, url };
        } catch (error) {
            console.error(`Connection error ${ip}:${port}:`, error.message);
            return { success: false, error: 'Erreur lors de la connexion au serveur.' };
        }
    });

    // Vérification statut serveur — streaming : chaque résultat est envoyé dès qu'il est prêt
    ipcMain.on('check-servers-start', async (event, servers, isInitialCheck = false) => {
        const sender = event.sender;
        console.log(`[SERVER CHECK] Starting streaming check - Initial: ${isInitialCheck}`);

        await Promise.all(Object.entries(servers).map(async ([gameType, serverList]) => {
            await Promise.all(serverList.map(async (server) => {
                const result = server.type === 'battlebit'
                    ? await withRetry(checkBattleBitServer, server, isInitialCheck)
                    : await withRetry(checkGameDigServer, server, isInitialCheck);

                if (!sender.isDestroyed()) {
                    sender.send('server-update', { gameType, server: result });
                    console.log(`[SERVER CHECK] Sent result for ${result.name || result.ip} (${gameType})`);
                }
            }));
        }));

        if (!sender.isDestroyed()) {
            sender.send('server-check-done');
            console.log('[SERVER CHECK] All checks complete');
        }
    });

    // News optimisé
    ipcMain.handle('fetch-news', async (_, newsUrl) => {
        try {
            const { data } = await axios.get(newsUrl, { 
                timeout: CONFIG.timeouts.api,
                headers: { 'User-Agent': 'Royal-Multi-Gamers-Launcher/1.0.0' }
            });
            return { success: true, data };
        } catch (error) {
            console.error('News fetch error:', error.message);
            return {
                success: true,
                data: { articles: [{ title: 'Erreur de connexion', content: 'Impossible de charger les actualités. Veuillez vérifier votre connexion internet et réessayer.', date: new Date().toISOString(), author: 'Système' }] }
            };
        }
    });
}

async function checkBattleBitServer(server, useRetryTimeouts = false) {
    try {
        const timeout = useRetryTimeouts ? CONFIG.timeouts.api * 2 : CONFIG.timeouts.api;
        
        const { data } = await axios.get(CONFIG.urls.battlebitApi, {
            timeout,
            headers: { 'User-Agent': 'Royal-Multi-Gamers-Launcher/1.0.0' }
        });

        const battlebitServer = data.find(s => s.Name === server.name);
        return battlebitServer ? {
            ...server, online: true, players: battlebitServer.Players,
            maxPlayers: battlebitServer.MaxPlayers, name: battlebitServer.Name,
            map: battlebitServer.Map || 'Inconnu', ping: 0,
            ip: battlebitServer.Ip, port: battlebitServer.Gameport
        } : { ...server, online: false, players: 0, maxPlayers: 254, map: 'N/A', ping: 0 };
    } catch (error) {
        console.error(`BattleBit server error ${server.name}:`, error.message);
        return { ...server, online: false, players: 0, maxPlayers: 254, map: 'N/A', ping: 0 };
    }
}



async function checkGameDigServer(server, useRetryTimeouts = false) {
    try {
        const timeouts = useRetryTimeouts ? {
            socketTimeout: CONFIG.timeouts.socketRetry,
            attemptTimeout: CONFIG.timeouts.attemptRetry
        } : {
            socketTimeout: CONFIG.timeouts.socket,
            attemptTimeout: CONFIG.timeouts.attempt
        };

        const state = await GameDig.query({
            type: server.type,
            host: server.ip,
            port: parseInt(server.queryPort || server.port),
            maxAttempts: 1,
            ...timeouts,
            givenPortOnly: true
        });

        return {
            ...server,
            online: true,
            players: state.players?.length || 0,
            maxPlayers: state.maxplayers || 100,
            name: state.name || server.name || 'Serveur',
            map: state.map || 'Inconnu',
            ping: state.ping || 0
        };
    } catch (error) {
        console.error(`Server error ${server.ip}:${server.queryPort || server.port}:`, error.message);
        return {
            ...server,
            online: false,
            players: 0,
            maxPlayers: 100,
            name: server.name || 'Serveur hors ligne',
            map: 'N/A',
            ping: 0
        };
    }
}

async function withRetry(checkFn, server, isInitialCheck) {
    // Capture la clé config AVANT que les fonctions de check ne modifient le nom
    const configKey = server.name || `${server.ip}:${server.port}`;

    let result = await checkFn(server, false);
    result._configKey = configKey;

    if (!result.online && isInitialCheck) {
        console.log(`Retrying server ${server.name || server.ip} with extended timeouts...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        result = await checkFn(server, true);
        result._configKey = configKey;
        if (result.online) {
            console.log(`Server ${server.name || server.ip} came online on retry`);
        }
    }
    return result;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
