const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    
    // External links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Server status — streaming (résultat envoyé serveur par serveur)
    startServerCheck: (servers, isInitialCheck) => ipcRenderer.send('check-servers-start', servers, isInitialCheck),
    onServerUpdate: (callback) => ipcRenderer.on('server-update', (_, data) => callback(data)),
    onServerCheckDone: (callback) => ipcRenderer.once('server-check-done', () => callback()),
    offServerListeners: () => {
        ipcRenderer.removeAllListeners('server-update');
        ipcRenderer.removeAllListeners('server-check-done');
    },
    
    // Server connection
    connectToServer: (serverInfo) => ipcRenderer.invoke('connect-to-server', serverInfo),
    
    // News
    fetchNews: (url) => ipcRenderer.invoke('fetch-news', url)
});
