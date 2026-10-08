// Preload script exposed to the renderer via contextBridge.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('articla', {
  setAlwaysOnTop: (val) => ipcRenderer.send('set-always-on-top', val),
  onAlwaysOnTopChanged: (cb) => ipcRenderer.on('always-on-top-changed', (_e, v) => cb(v)),
});