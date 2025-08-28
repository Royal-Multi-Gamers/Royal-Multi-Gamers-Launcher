const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
    closeWindow: () => ipcRenderer.invoke('window-close'),
    
    // External links
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    
    // Server status
    checkServerStatus: (serverInfo) => ipcRenderer.invoke('check-server-status', serverInfo),
    checkMultipleServers: (servers, isInitialCheck) => ipcRenderer.invoke('check-multiple-servers', servers, isInitialCheck),
    
    // Server connection
    connectToServer: (serverInfo) => ipcRenderer.invoke('connect-to-server', serverInfo),
    
    // News
    fetchNews: (url) => ipcRenderer.invoke('fetch-news', url)
});
