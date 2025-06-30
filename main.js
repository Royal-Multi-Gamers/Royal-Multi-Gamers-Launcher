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
    timeouts: { socket: 1500, attempt: 2000, news: 5000 },
    protocols: {
        source: 'css', csgo: 'csgo', eco: 'eco',
        battlebit: 'https://publicapi.battlebit.cloud/Servers/GetServerList'
    },
    urls: {
        steam: (ip, port) => `steam://connect/${ip}:${port}`,
        battlebit: 'steam://rungameid/671860/',
        eco: (ip, port) => `http://${ip}:${port}`
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
        'open-external': (_, url) => shell.openExternal(url)
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

    // Vérification statut serveur optimisée
    ipcMain.handle('check-multiple-servers', async (_, servers) => {
        const results = {};
        
        for (const [gameType, serverList] of Object.entries(servers)) {
            results[gameType] = await Promise.all(serverList.map(server => 
                server.type === 'battlebit' ? checkBattleBitServer(server) : checkGameDigServer(server)
            ));
        }
        
        return results;
    });

    // News optimisé
    ipcMain.handle('fetch-news', async (_, newsUrl) => {
        try {
            const { data } = await axios.get(newsUrl, { 
                timeout: CONFIG.timeouts.news,
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

async function checkBattleBitServer(server) {
    try {
        const { data } = await axios.get(CONFIG.protocols.battlebit, {
            timeout: CONFIG.timeouts.news,
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

async function checkGameDigServer(server) {
    try {
        const state = await GameDig.query({
            type: server.type, host: server.ip,
            port: parseInt(server.queryPort || server.port),
            maxAttempts: 1, socketTimeout: CONFIG.timeouts.socket,
            attemptTimeout: CONFIG.timeouts.attempt, givenPortOnly: true
        });

        return {
            ...server, online: true,
            players: state.players?.length || 0,
            maxPlayers: state.maxplayers || 100,
            name: state.name || server.name || 'Serveur',
            map: state.map || 'Inconnu', ping: state.ping || 0
        };
    } catch (error) {
        console.error(`Server error ${server.ip}:${server.queryPort || server.port}:`, error.message);
        return {
            ...server, online: false, players: 0, maxPlayers: 100,
            name: server.name || 'Serveur hors ligne', map: 'N/A', ping: 0
        };
    }
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
