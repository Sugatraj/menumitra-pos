// const { app, BrowserWindow, protocol, ipcMain, Notification } = require('electron');
// const { autoUpdater } = require('electron-updater');
// const log = require('electron-log');
// const path = require('path');
// const isDev = require('electron-is-dev');
// const fs = require('fs');

// // Prevent multiple instances
// const gotTheLock = app.requestSingleInstanceLock();
// if (!gotTheLock) {
//   app.quit();
//   return;
// }

// // Configure auto-updater logging
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'debug';
// autoUpdater.autoDownload = false;

// let mainWindow;

// function createWindow() {
//   // Register protocol for serving local files
//   protocol.registerFileProtocol('app', (request, callback) => {
//     const url = request.url.substring(6); // Remove 'app://' from url
//     callback({ path: path.normalize(`${__dirname}/${url}`) });
//   });

//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     icon: path.join(__dirname, 'icon.ico'),
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, 'preload.js'),
//       // Add these settings to fix localStorage access
//       sandbox: false,
//       partition: 'persist:mainwindow'
//     }
//   });

//   // Load app using custom protocol in production
//   if (isDev) {
//     mainWindow.loadURL('http://localhost:3000');
//   } else {
//     mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
//   }

//   if (isDev) {
//     mainWindow.webContents.openDevTools();
//   }

//   // Add IPC handler for notifications
//   ipcMain.on('show-notification', (event, { title, body }) => {
//     try {
//       new Notification({
//         title: title || 'MenuMitra',
//         body: body || '',
//         icon: path.join(__dirname, 'icon.ico')
//       }).show();
//     } catch (error) {
//       console.warn('Error showing notification:', error);
//     }
//   });

//   // Initialize auto-updater
//   if (!isDev) {
//     autoUpdater.checkForUpdates();
//   }

//   mainWindow.on('closed', () => {
//     app.quit();
//   });
// }

// // Auto-updater events
// autoUpdater.on('checking-for-update', () => {
//   mainWindow?.webContents.send('update-message', 'Checking for updates...');
// });

// autoUpdater.on('update-available', (info) => {
//   mainWindow?.webContents.send('update-available', info);
// });

// autoUpdater.on('update-not-available', () => {
//   mainWindow?.webContents.send('update-not-available');
// });

// autoUpdater.on('error', (err) => {
//   console.error('Update error:', err);
//   mainWindow?.webContents.send('update-error', err.message);
// });

// autoUpdater.on('download-progress', (progressObj) => {
//   mainWindow?.webContents.send('download-progress', progressObj);
// });

// autoUpdater.on('update-downloaded', () => {
//   mainWindow?.webContents.send('update-downloaded');
// });

// // IPC handlers
// ipcMain.handle('check-update', async () => {
//   return await autoUpdater.checkForUpdates();
// });

// ipcMain.handle('download-update', async () => {
//   return await autoUpdater.downloadUpdate();
// });

// ipcMain.handle('start-update', () => {
//   autoUpdater.quitAndInstall();
// });

// app.whenReady().then(() => {
//   createWindow();
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });

// // Handle second instance
// app.on('second-instance', () => {
//   const windows = BrowserWindow.getAllWindows();
//   if (windows.length) {
//     if (windows[0].isMinimized()) {
//       windows[0].restore();
//     }
//     windows[0].focus();
//   }
// });



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

// Configure auto-updater logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';
autoUpdater.autoDownload = false;

const server = 'https://Shekru-Labs-India/menumitra_pos/releases/download'; // Your repository URL
const feedURL = `${server}/v${app.getVersion()}/`; // Dynamic version

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
      nodeIntegration: false,
      contextIsolation: true,
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
    autoUpdater.checkForUpdates(); // Check for updates on launch
  }

  mainWindow.on('closed', () => {
    app.quit();
  });
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  mainWindow?.webContents.send('update-message', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  console.error('Update error:', err);
  mainWindow?.webContents.send('update-error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', () => {
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
