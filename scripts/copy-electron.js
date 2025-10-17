const fs = require('fs');
const path = require('path');

// Ensure build directory exists
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy main Electron files to build directory
const srcMainDir = path.join(__dirname, '../src/main');
const filesToCopy = ['main.js', 'preload.js', 'database.js'];

filesToCopy.forEach(file => {
  const srcPath = path.join(srcMainDir, file);
  const destPath = path.join(buildDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to build directory`);
  } else {
    console.warn(`Warning: ${file} not found in src/main/`);
  }
});

console.log('Electron files copied to build directory successfully!');

