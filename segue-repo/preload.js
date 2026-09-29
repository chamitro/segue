const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("segue", {
  pickFiles: () => ipcRenderer.invoke("pick-files"),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  readFile: p => ipcRenderer.invoke("read-file", p)
});
