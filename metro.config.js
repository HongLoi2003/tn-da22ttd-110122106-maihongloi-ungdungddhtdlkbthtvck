const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for production builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      // Drop console statements
      drop_console: true,
      // Remove debugger statements
      drop_debugger: true,
      // Keep function names for better error reporting
      keep_fnames: true,
    },
    mangle: {
      // Keep class names for better error reporting
      keep_classnames: true,
    },
  },
};

// Handle large assets better
config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts,
    'db',
    'mp3',
    'ttf',
    'obj',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
  ],
};

module.exports = config;
