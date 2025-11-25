const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../templates');
const destDir = path.join(__dirname, '../dist/templates');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy all files from templates to dist/templates
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ Copied ${file} to dist/templates/`);
  });
} else {
  console.warn('⚠ Templates directory not found');
}

