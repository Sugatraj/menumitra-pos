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
autoUpdater.autoDownload = false; // Let's control download manually
autoUpdater.autoInstallOnAppQuit = true; // Change to true for automatic downloads

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
  token: process.env.GH_TOKEN,
  headers: {
    'Authorization': `token ${process.env.GH_TOKEN}`
  },
  updateConfigPath: path.join(app.getPath('userData'), 'update.json')
};

// Configure auto-updater
autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.allowDowngrade = false;
autoUpdater.setFeedURL(updateConfig);

// Add detailed logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'debug';

// Ensure update directory exists and is writable
function ensureUpdateDirectory() {
  const updatePath = path.join(app.getPath('userData'), 'updates');
  try {
    if (!fs.existsSync(updatePath)) {
      fs.mkdirSync(updatePath, { recursive: true, mode: 0o755 }); // Add proper permissions
    }
    // Test write permissions
    const testFile = path.join(updatePath, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (error) {
    log.error('Update directory error:', error);
    return false;
  }
}

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
    try {
      // Check if token is from collaborator
      const checkToken = async () => {
        try {
          const result = await autoUpdater.checkForUpdates();
          log.info('Update check result:', result);
          return true;
        } catch (error) {
          log.error('Token validation error:', error);
          return false;
        }
      };

      if (checkToken()) {
        autoUpdater.checkForUpdates();
      } else {
        log.error('Invalid token permissions');
        mainWindow?.webContents.send('update-error', 'Invalid token permissions. Please ensure you have access to the repository.');
      }
    } catch (error) {
      log.error('Error during update check:', error);
    }
  }

  if (!isDev) {
    if (ensureUpdateDirectory()) {
      autoUpdater.setFeedURL(updateConfig);
      autoUpdater.checkForUpdates()
        .then(updateCheckResult => {
          log.info('Update check result:', updateCheckResult);
        })
        .catch(error => {
          log.error('Update check error:', error);
          mainWindow?.webContents.send('update-error', error.message);
        });
    }
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
  log.error('Update error:', error);
  
  // Handle specific errors
  if (error.code === 'EPERM') {
    mainWindow?.webContents.send('update-error', 'Permission denied. Please run the app as administrator.');
  } else if (error.code === 'ENOENT') {
    mainWindow?.webContents.send('update-error', 'Update file not found. Please try again.');
  } else {
    mainWindow?.webContents.send('update-error', `Update failed: ${error.message}`);
  }
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
  try {
    if (!ensureUpdateDirectory()) {
      throw new Error('Update directory not accessible');
    }
    const result = await autoUpdater.checkForUpdates();
    // Return a simplified version of the update info
    return {
      updateAvailable: result?.updateInfo?.version !== app.getVersion(),
      currentVersion: app.getVersion(),
      newVersion: result?.updateInfo?.version,
      releaseNotes: result?.updateInfo?.releaseNotes || ''
    };
  } catch (error) {
    log.error('Check update error:', error);
    throw new Error(error.message);
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (!ensureUpdateDirectory()) {
      throw new Error('Cannot access update directory');
    }
    return await autoUpdater.downloadUpdate();
  } catch (error) {
    log.error('Download failed:', error);
    throw error;
  }
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

// Update error handling
autoUpdater.on('error', (error) => {
  log.error('Update error:', error);
  if (error.code === 404) {
    mainWindow?.webContents.send('update-error', 'No releases found. Please create a release on GitHub.');
  } else {
    mainWindow?.webContents.send('update-error', error.message);
  }
});

autoUpdater.on('error', (error) => {
  log.error('Update error:', error);
  mainWindow?.webContents.send('update-error', error.toString());
  
  if (error.message.includes('404')) {
    log.info('No releases found or access denied');
    mainWindow?.webContents.send('update-message', 'No updates available');
  }
});

// Update error handling with retry
let updateRetryCount = 0;
const MAX_RETRIES = 3;

autoUpdater.on('error', (error) => {
  log.error('Update error:', error);
  
  if (error.code === 'EPERM' && updateRetryCount < MAX_RETRIES) {
    updateRetryCount++;
    log.info(`Retrying update download (${updateRetryCount}/${MAX_RETRIES})...`);
    setTimeout(() => {
      autoUpdater.downloadUpdate().catch(err => {
        log.error('Retry failed:', err);
      });
    }, 1000 * updateRetryCount);
  } else {
    mainWindow?.webContents.send('update-error', {
      message: error.message,
      details: error.stack
    });
  }
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  // Send only necessary update information
  mainWindow?.webContents.send('update-available', {
    version: info.version,
    releaseNotes: info.releaseNotes || '',
    releaseDate: info.releaseDate
  });
});
