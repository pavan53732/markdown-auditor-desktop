const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (data) => ipcRenderer.invoke('config:write', data),
  validateAPI: (payload) => ipcRenderer.invoke('api:validate', payload),
  callAPI: (payload) => ipcRenderer.invoke('api:call', payload)
});