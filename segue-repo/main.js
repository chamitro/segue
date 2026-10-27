const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const AUDIO = /\.(mp3|wav|m4a|aac|flac|ogg|oga|opus|webm|aif|aiff)$/i;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 500,
    title: "Segue",
    icon: path.join(__dirname, "app", "icon.png"),
    backgroundColor: "#11152A",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, "app", "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  // Stop the window from navigating away when files are dropped outside the drop zone
  win.webContents.on("will-navigate", e => e.preventDefault());
  // F12 or Ctrl+Shift+I opens developer tools (useful for reporting problems)
  win.webContents.on("before-input-event", (e, input) => {
    if (input.type === "keyDown" && (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i"))) win.webContents.toggleDevTools();
  });
  win.webContents.on("render-process-gone", async (_e, d) => {
    await dialog.showMessageBox(win, { type: "error", title: "Segue", message: "The window stopped working.", detail: `Reason: ${d.reason} (exit code ${d.exitCode}). A very large audio file can cause this. The window will reload.` });
    win.reload();
  });
  win.webContents.on("unresponsive", () => console.error("Segue window unresponsive"));
}

async function scan(dir, out, depth = 0) {
  if (depth > 12) return;
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await scan(p, out, depth + 1);
    else if (e.isFile() && AUDIO.test(e.name)) out.push({ path: p, name: e.name });
  }
}

ipcMain.handle("pick-files", async () => {
  const r = await dialog.showOpenDialog(win, {
    title: "Choose songs",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Audio", extensions: ["mp3", "wav", "m4a", "aac", "flac", "ogg", "oga", "opus", "webm", "aif", "aiff", "MP3", "WAV", "M4A", "FLAC", "OGG"] },
      { name: "All files", extensions: ["*"] }
    ]
  });
  if (r.canceled) return null;
  return r.filePaths.filter(p => AUDIO.test(p)).map(p => ({ path: p, name: path.basename(p) }));
});

ipcMain.handle("pick-folder", async () => {
  const r = await dialog.showOpenDialog(win, { title: "Choose a music folder", properties: ["openDirectory"] });
  if (r.canceled) return null;
  const out = [];
  await scan(r.filePaths[0], out);
  return out;
});

ipcMain.handle("read-file", async (_e, p) => {
  if (typeof p !== "string" || !AUDIO.test(p)) throw new Error("Not an audio file");
  return fs.readFile(p);
});

Menu.setApplicationMenu(process.platform === "darwin" ? Menu.buildFromTemplate([{ role: "appMenu" }, { role: "editMenu" }, { role: "windowMenu" }]) : null);
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
