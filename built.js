const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(publicDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created assets directory');
}

// Copy index.html to public
const indexPath = path.join(__dirname, 'index.html');
const publicIndexPath = path.join(publicDir, 'index.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, publicIndexPath);
  console.log('✅ Copied index.html to public');
} else {
  console.error('❌ index.html not found!');
  process.exit(1);
}

// Copy assets if exists
const sourceAssetsDir = path.join(__dirname, 'assets');
if (fs.existsSync(sourceAssetsDir)) {
  const files = fs.readdirSync(sourceAssetsDir);
  files.forEach(file => {
    const srcPath = path.join(sourceAssetsDir, file);
    const destPath = path.join(assetsDir, file);
    fs.copyFileSync(srcPath, destPath);
  });
  console.log('✅ Copied assets to public/assets');
}

console.log('🎉 Build completed successfully!');