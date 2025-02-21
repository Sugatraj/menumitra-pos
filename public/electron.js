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
autoUpdater.autoDownload = true; // Change to true for automatic downloads
autoUpdater.autoInstallOnAppQuit = false; // Don't install automatically on quit

const server = 'https://Shekru-Labs-India/menumitra_pos/releases/download'; // Your repository URL

// Update token handling
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
  log.error('GitHub token not found in environment variables!');
} else {
  log.info('GitHub token found');
  autoUpdater.requestHeaders = {
    'Authorization': `token ${token}`
  };
}

const feedURL = {
  provider: 'github',
  owner: 'Sugatraj',
  repo: 'menumitra-pos',
  private: true,
  token: token
};

// Update the configurations
const updateConfig = {
  provider: 'github',
  owner: 'Sugatraj',
  repo: 'menumitra-pos',
  private: true,
  releaseType: 'release'
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
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });

  // Load app using custom protocol in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // Fix the path to load index.html
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Initialize auto-updater with the correct feed URL
  if (!isDev) {
    if (!token) {
      log.error('GitHub token not found!');
    } else {
      autoUpdater.setFeedURL(feedURL);
      autoUpdater.checkForUpdates()
        .then(updateCheckResult => {
          log.info('Update check result:', updateCheckResult);
        })
        .catch(error => {
          log.error('Update check error:', error);
        });
    }
  }

  // Check for updates immediately after window creation
  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(err => {
        log.error('Update check failed:', err);
      });
    }, 3000); // Check after 3 seconds

    // Check for updates every 30 minutes
    setInterval(() => {
      autoUpdater.checkForUpdates().catch(err => {
        log.error('Update check failed:', err);
      });
    }, 30 * 60 * 1000);
  }

  if (!isDev) {
    // Configure auto-updater
    autoUpdater.setFeedURL(updateConfig);
    log.info('Update feed URL set:', updateConfig);
    
    // Check updates with more detailed logging
    autoUpdater.checkForUpdates()
      .then(updateCheckResult => {
        log.info('Update check result:', updateCheckResult);
        if (updateCheckResult?.updateInfo) {
          log.info('Update info:', updateCheckResult.updateInfo);
        }
      })
      .catch(error => {
        log.error('Update check error:', error);
        log.error('Error details:', error?.stack || 'No stack trace');
      });

    // Check for updates immediately
    autoUpdater.checkForUpdates().then((updateCheckResult) => {
      log.info('Initial update check result:', updateCheckResult);
    }).catch((error) => {
      log.error('Update check error:', error);
    });

    // Check for updates every 5 minutes
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 5 * 60 * 1000);
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
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  }
  // Auto download the update
  autoUpdater.downloadUpdate().catch(err => {
    log.error('Download failed:', err);
  });
});

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available');
});

autoUpdater.on('error', (error) => {
  log.error('AutoUpdater error:', error);
  log.error('Error details:', error?.stack || 'No stack trace');
  mainWindow?.webContents.send('update-error', {
    message: error.message,
    details: error?.stack
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  log.info(message);
  mainWindow?.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  mainWindow?.webContents.send('update-downloaded', {
    version: info.version,
    releaseNotes: info.releaseNotes
  });
  
  // Notify user that update is ready
  const notification = new Notification({
    title: 'Update Ready',
    body: `Version ${info.version} is ready to install`
  });
  notification.show();
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
  // Register file protocol handler
  protocol.registerFileProtocol('file', (request, callback) => {
    const filePath = request.url.replace('file:///', '');
    callback(decodeURI(path.normalize(`${__dirname}/../${filePath}`)));
  });

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
