const fs = require('fs-extra');
const path = require('path');

// Ensure build directory exists
fs.ensureDirSync(path.join(process.cwd(), 'build'));

// Copy electron files
fs.copySync(
  path.join(process.cwd(), 'public', 'electron.js'),
  path.join(process.cwd(), 'build', 'electron.js')
);

fs.copySync(
  path.join(process.cwd(), 'public', 'preload.js'),
  path.join(process.cwd(), 'build', 'preload.js')
);

console.log('Electron files copied to build directory');
