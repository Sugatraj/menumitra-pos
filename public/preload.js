const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);

contextBridge.exposeInMainWorld('updater', {
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  startUpdate: () => ipcRenderer.invoke('start-update'),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_, message) => callback(message)),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, info) => callback(info)),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', () => callback()),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_, message) => callback(message))
});