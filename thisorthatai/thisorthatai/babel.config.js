module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:expo-env', {
        moduleName: '@env',
        path: '.env.local',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }]
    ]
  };
};
