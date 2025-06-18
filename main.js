const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const { GameDig } = require('gamedig');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            backgroundThrottling: false,
            paintWhenInitiallyHidden: true,
            backgroundColor: '#1a1a1a',
            hardwareAcceleration: true
        },
        frame: false,
        titleBarStyle: 'hidden',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        show: false,
        backgroundColor: '#1a1a1a',
        // Improve window performance
        hasShadow: false,
        transparent: false
    });

    // Disable background throttling when window is hidden
    mainWindow.webContents.setBackgroundThrottling(false);

    mainWindow.loadFile('index.html');

    // Wait for both did-finish-load and dom-ready before showing the window
    let didFinishLoad = false;
    let domReady = false;

    const tryShowWindow = () => {
        if (didFinishLoad && domReady) {
            // Reduced delay and ensure window is ready
            setTimeout(() => {
                if (!mainWindow.isDestroyed()) {
                    mainWindow.show();
                    // Force a repaint to ensure smooth transition
                    mainWindow.webContents.executeJavaScript(`
                        document.body.style.transform = 'translateZ(0)';
                        void(document.body.offsetHeight);
                    `);
                }
            }, 300);
        }
    };

    mainWindow.webContents.once('did-finish-load', () => {
        didFinishLoad = true;
        tryShowWindow();
    });

    mainWindow.webContents.once('dom-ready', () => {
        domReady = true;
        tryShowWindow();
    });

    // Window controls
    ipcMain.handle('window-minimize', () => mainWindow.minimize());
    ipcMain.handle('window-maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });
    ipcMain.handle('window-close', () => mainWindow.close());

    // External links
    ipcMain.handle('open-external', (event, url) => shell.openExternal(url));

    // Server connection using GameDig for validation
    ipcMain.handle('connect-to-server', async (event, serverInfo) => {
        try {
            const { ip, port, protocol } = serverInfo;
            
            // Skip GameDig validation for BattleBit servers
            if (protocol !== 'battlebit') {
                // First verify server is online with GameDig
                let gameType = 'css'; // default
                if (protocol === 'csgo') gameType = 'csgo';
                else if (protocol === 'source') gameType = 'css';
                else if (protocol === 'eco') gameType = 'eco';
                
                try {
                    await GameDig.query({
                        type: gameType,
                        host: ip,
                        port: parseInt(port),
                        maxAttempts: 1,
                        socketTimeout: 2000,
                        attemptTimeout: 3000
                    });
                } catch (queryError) {
                    console.warn(`Server ${ip}:${port} may be offline, but attempting connection anyway`);
                }
            }

            // Generate connection URL based on protocol
            let url;
            switch(protocol) {
                case 'source':
                case 'csgo':
                    url = `steam://connect/${ip}:${port}`;
                    break;
                case 'battlebit':
                    url = `steam://rungameid/671860/`;
                    break;
                case 'eco':
                    url = `http://${ip}:${port}`;
                    break;
                default:
                    url = `steam://connect/${ip}:${port}`;
            }
            
            shell.openExternal(url);
            return { success: true, url: url };
        } catch (error) {
            console.error(`Error connecting to server ${serverInfo.ip}:${serverInfo.port}:`, error.message);
            return { 
                success: false, 
                error: 'Erreur lors de la connexion au serveur.' 
            };
        }
    });

    // Server status check
    ipcMain.handle('check-server-status', async (event, serverInfo) => {
        try {
            const { ip, port, type } = serverInfo;
            
            // Use GameDig directly
            const state = await GameDig.query({
                type: type,
                host: ip,
                port: parseInt(port),
                maxAttempts: 2,
                socketTimeout: 2000,
                attemptTimeout: 3000
            });

            return {
                online: true,
                players: state.players ? state.players.length : 0,
                maxPlayers: state.maxplayers || 100,
                name: state.name || 'Serveur',
                map: state.map || 'Inconnu',
                ping: state.ping || 0
            };
        } catch (error) {
            console.error(`Error checking server ${serverInfo.ip}:${serverInfo.port}:`, error.message);
            return {
                online: false,
                players: 0,
                maxPlayers: 100,
                name: 'Serveur hors ligne',
                map: 'N/A',
                ping: 0
            };
        }
    });

    // Multiple servers status check
    ipcMain.handle('check-multiple-servers', async (event, servers) => {
        const results = {};
        
        for (const [gameType, serverList] of Object.entries(servers)) {
            results[gameType] = [];
            
            for (const server of serverList) {
                if (server.type === 'battlebit') {
                    // Handle BattleBit servers using their public API
                    try {
                        const response = await axios.get('https://publicapi.battlebit.cloud/Servers/GetServerList', {
                            timeout: 5000,
                            headers: {
                                'User-Agent': 'Royal-Multi-Gamers-Launcher/1.0.0'
                            }
                        });

                        // Find the server by name
                        const battlebitServer = response.data.find(s => s.Name === server.name);
                        
                        if (battlebitServer) {
                            results[gameType].push({
                                ...server,
                                online: true,
                                players: battlebitServer.Players,
                                maxPlayers: battlebitServer.MaxPlayers,
                                name: battlebitServer.Name,
                                map: battlebitServer.Map || 'Inconnu',
                                ping: 0,
                                ip: battlebitServer.Ip,
                                port: battlebitServer.Gameport
                            });
                        } else {
                            results[gameType].push({
                                ...server,
                                online: false,
                                players: 0,
                                maxPlayers: 254,
                                name: server.name,
                                map: 'N/A',
                                ping: 0
                            });
                        }
                    } catch (error) {
                        console.error(`Error checking BattleBit server ${server.name}:`, error.message);
                        results[gameType].push({
                            ...server,
                            online: false,
                            players: 0,
                            maxPlayers: 254,
                            name: server.name,
                            map: 'N/A',
                            ping: 0
                        });
                    }
                } else {
                    // Handle other servers using GameDig
                    try {
                        const state = await GameDig.query({
                            type: server.type,
                            host: server.ip,
                            port: parseInt(server.port),
                            maxAttempts: 2,
                            socketTimeout: 2000,
                            attemptTimeout: 3000
                        });

                        results[gameType].push({
                            ...server,
                            online: true,
                            players: state.players ? state.players.length : 0,
                            maxPlayers: state.maxplayers || 100,
                            name: state.name || server.name || 'Serveur',
                            map: state.map || 'Inconnu',
                            ping: state.ping || 0
                        });
                    } catch (error) {
                        console.error(`Error checking server ${server.ip}:${server.port}:`, error.message);
                        results[gameType].push({
                            ...server,
                            online: false,
                            players: 0,
                            maxPlayers: 100,
                            name: server.name || 'Serveur hors ligne',
                            map: 'N/A',
                            ping: 0
                        });
                    }
                }
            }
        }
        
        return results;
    });

    // News fetching
    ipcMain.handle('fetch-news', async (event, newsUrl) => {
        try {
            const response = await axios.get(newsUrl, { 
                timeout: 5000,
                headers: {
                    'User-Agent': 'Royal-Multi-Gamers-Launcher/1.0.0'
                }
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching news:', error.message);
            // Return fallback news data
            return {
                success: true,
                data: {
                    articles: [
                        {
                            title: 'Chargement des news...',
                            content: 'Les actualités seront bientôt disponibles.',
                            date: new Date().toISOString(),
                            author: 'Système'
                        }
                    ]
                }
            };
        }
    });
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
