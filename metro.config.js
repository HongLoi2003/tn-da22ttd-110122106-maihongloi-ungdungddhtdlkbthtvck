const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Thêm hỗ trợ cho web
config.resolver.assetExts.push(
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2'
);

module.exports = config;
