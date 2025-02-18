const builder = require('electron-builder');
const Platform = builder.Platform;

async function buildApp() {
  try {
    await builder.build({
      targets: Platform.WINDOWS.createTarget(),
      config: {
        appId: 'com.menumitra.pos',
        productName: 'POS Outlet',
        files: ['build/**/*', 'node_modules/**/*'],
        directories: {
          output: 'dist',
          buildResources: 'assets'
        },
        win: {
          target: 'nsis',
          icon: 'public/icon.ico'
        },
        nsis: {
          oneClick: true,
          perMachine: false
        },
        asar: true,
        compression: 'maximum'
      }
    });
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
