const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: {
    appId: 'com.menumitra.pos',
    productName: 'POS Outlet',
    win: {
      target: ['nsis'],
      icon: 'public/icon.ico'
    },
    nsis: {
      oneClick: false,
      perMachine: true,
      allowElevation: true,
      allowToChangeInstallationDirectory: true
    }
  }
}).catch((error) => {
  console.error('Error during build:', error);
});
