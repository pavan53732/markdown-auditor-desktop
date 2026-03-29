const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => ipcRenderer.invoke('config:read'),
  writeConfig: (data) => ipcRenderer.invoke('config:write', data),
  readCache: () => ipcRenderer.invoke('cache:read'),
  writeCache: (data) => ipcRenderer.invoke('cache:write', data),
  clearCache: () => ipcRenderer.invoke('cache:clear'),
  getCacheStats: () => ipcRenderer.invoke('cache:stats'),
  listHistory: () => ipcRenderer.invoke('history:list'),
  readHistorySession: (id) => ipcRenderer.invoke('history:read', id),
  addHistorySession: (payload) => ipcRenderer.invoke('history:add', payload),
  deleteHistorySession: (id) => ipcRenderer.invoke('history:delete', id),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  validateAPI: (payload) => ipcRenderer.invoke('api:validate', payload),
  callAPI: (payload) => ipcRenderer.invoke('api:call', payload)
});