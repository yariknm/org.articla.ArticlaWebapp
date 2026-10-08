// Main process for the Articla Electron wrapper.
// Loads https://articla.org in a frameless/custom-window Chromium view.
const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, dialog, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({ defaults: { windowState: { width: 1280, height: 800, x: undefined, y: undefined } } });

let tray = null;
let alwaysOnTop = false;

function createWindow() {
  const saved = store.get('windowState');
  const win = new BrowserWindow({
    width: saved.width || 1280,
    height: saved.height || 800,
    x: saved.x,
    y: saved.y,
    minWidth: 900,
    minHeight: 600,
    title: 'Articla',
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: false,
    },
  });

  // Persist window state
  const saveState = () => {
    const bounds = win.getBounds();
    store.set('windowState', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    });
  };
  win.on('resize', saveState);
  win.on('move', saveState);

  // Custom application menu
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Window', accelerator: 'Ctrl+Shift+N', click: () => createWindow() },
        { type: 'separator' },
        { label: 'Always on Top', type: 'checkbox', checked: alwaysOnTop, click: (e) => { alwaysOnTop = e.checked; win.setAlwaysOnTop(alwaysOnTop); } },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Ctrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'F5', click: () => win.reload() },
        { label: 'Hard Reload', accelerator: 'Ctrl+F5', click: () => win.reloadIgnoringCache() },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CtrlPlus', click: () => { const z = win.webContents.getZoomFactor(); win.webContents.zoomFactor = z * 1.1; } },
        { label: 'Zoom Out', accelerator: 'CtrlMinus', click: () => { const z = win.webContents.getZoomFactor(); win.webContents.zoomFactor = z * 0.9; } },
        { label: 'Reset Zoom', accelerator: 'Ctrl0', click: () => win.webContents.zoomFactor = 1.0 },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About Articla', click: () => dialog.showMessageBox(win, { type: 'info', title: 'About Articla', message: 'Articla Webapp', detail: 'Desktop client for https://articla.org\nVersion 1.0.0' }) },
        { label: 'Open Articla Website', click: () => shell.openExternal('https://articla.org') },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Tray icon
  const icon = nativeImage.createFromPath(path.join(__dirname, 'images', 'articla.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Articla', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', () => win.show());

  win.loadURL('https://articla.org');

  // Inject custom CSS for dark mode if needed
  win.webContents.insertCSS(':root { color-scheme: dark; }');

  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('set-always-on-top', (e, val) => {
  const w = BrowserWindow.fromId(e.sender.id);
  if (w) w.setAlwaysOnTop(val);
});