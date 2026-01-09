const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const { resolve } = require("metro-resolver");

let config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

const defaultResolveRequest =
  config.resolver.resolveRequest ||
  ((context, moduleName, platform) => resolve(context, moduleName, platform));

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "tslib") {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules", "tslib", "tslib.es6.mjs"),
    };
  }
  return defaultResolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
