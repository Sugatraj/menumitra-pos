const { app, BrowserWindow, protocol, ipcMain, Notification } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  return;
}

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = false;

const server = 'https://Shekru-Labs-India/menumitra_pos/releases/download'; // Your repository URL
const feedURL = {
  provider: 'github',
  owner: 'Sugatraj',
  repo: 'menumitra-pos',
  private: true,
  token: process.env.GH_TOKEN
};

let mainWindow;

function createWindow() {
  // Register protocol for serving local files
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substring(6); // Remove 'app://' from url
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      partition: 'persist:mainwindow'
    }
  });

  // Load app using custom protocol in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Initialize auto-updater with the correct feed URL
  if (!isDev) {
    autoUpdater.setFeedURL(feedURL); // Set the feed URL to the repository's release URL
    autoUpdater.checkForUpdatesAndNotify(); // Check for updates on launch
  }

  mainWindow.on('closed', () => {
    app.quit();
  });
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  mainWindow?.webContents.send('update-message', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  const currentVersion = app.getVersion();
  if (info.version > currentVersion) {
    mainWindow?.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  log.error('AutoUpdater error:', err);
  mainWindow?.webContents.send('update-error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  mainWindow?.webContents.send('update-downloaded');
});

// IPC handlers
ipcMain.handle('check-update', async () => {
  return await autoUpdater.checkForUpdates();
});

ipcMain.handle('download-update', async () => {
  return await autoUpdater.downloadUpdate();
});

ipcMain.handle('start-update', () => {
  autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
  createWindow();
});

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

app.on('second-instance', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length) {
    if (windows[0].isMinimized()) {
      windows[0].restore();
    }
    windows[0].focus();
  }
});
