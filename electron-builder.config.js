module.exports = {
  appId: 'com.menumitra.pos',
  productName: 'POS Outlet',
  files: ['build/**/*'],
  directories: {
    output: 'release'
  },
  win: {
    target: 'portable',
    icon: 'public/icon.ico'
  }
};
