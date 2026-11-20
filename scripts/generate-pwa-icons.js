#!/usr/bin/env node
/**
 * Generate PWA icons from favicon.svg
 * Usage: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
const faviconPath = path.join(frontendPublicDir, 'favicon.svg');

console.log('Generating PWA icons from favicon.svg...');

try {
  // Check if favicon.svg exists
  if (!fs.existsSync(faviconPath)) {
    console.error(`Error: ${faviconPath} not found`);
    process.exit(1);
  }

  // Generate 192x192 icon
  console.log('Generating icon-192.png (192x192)...');
  execSync(`npx svg2png "${faviconPath}" --width=192 --height=192 --output="${path.join(frontendPublicDir, 'icon-192.png')}"`, {
    stdio: 'inherit'
  });

  // Generate 512x512 icon
  console.log('Generating icon-512.png (512x512)...');
  execSync(`npx svg2png "${faviconPath}" --width=512 --height=512 --output="${path.join(frontendPublicDir, 'icon-512.png')}"`, {
    stdio: 'inherit'
  });

  console.log('✓ PWA icons generated successfully');
  console.log(`  - ${path.join(frontendPublicDir, 'icon-192.png')}`);
  console.log(`  - ${path.join(frontendPublicDir, 'icon-512.png')}`);
} catch (error) {
  console.error('Error generating icons:', error.message);
  process.exit(1);
}
