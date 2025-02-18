const fs = require('fs-extra');
const path = require('path');

async function copyFiles() {
  try {
    // Ensure build directory exists
    const buildDir = path.join(__dirname, 'build');
    await fs.ensureDir(buildDir);

    // Copy electron.js
    await fs.copy(
      path.join(__dirname, 'public', 'electron.js'),
      path.join(buildDir, 'electron.js')
    );

    // Copy preload.js
    await fs.copy(
      path.join(__dirname, 'public', 'preload.js'),
      path.join(buildDir, 'preload.js')
    );

    // Copy and update package.json
    const packageJson = require('./package.json');
    packageJson.main = './electron.js';
    await fs.writeJson(
      path.join(buildDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    );

    console.log('Files copied successfully');
  } catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
  }
}

copyFiles();
