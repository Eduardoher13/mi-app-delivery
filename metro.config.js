const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { resolve } = require('metro-resolver');

const config = getDefaultConfig(__dirname);

const { resolveRequest } = config.resolver;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-async-hook') {
    return {
      filePath: require.resolve('react-async-hook/dist/index.js'),
      type: 'sourceFile',
    };
  }

  if (resolveRequest) {
    return resolveRequest(context, moduleName, platform);
  }

  return resolve(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
