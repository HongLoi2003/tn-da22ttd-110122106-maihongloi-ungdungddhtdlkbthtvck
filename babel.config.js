module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './app',
            '@assets': './assets',
            '@components': './app/components',
            '@utils': './app/utils',
            '@services': './app/services',
            '@config': './app/config',
          },
        },
      ],
      // Remove console logs in production
      process.env.NODE_ENV === 'production' ? 'transform-remove-console' : null,
      'react-native-reanimated/plugin',
    ].filter(Boolean),
  };
};
