const builder = require('electron-builder');

builder.build({
  config: {
    directories: {
      output: 'dist',
      app: 'build'
    },
    files: ['build/**/*'],
    win: {
      target: 'nsis',
      icon: 'public/icon.ico'
    }
  }
}).then(() => {
  console.log('Build completed!');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
