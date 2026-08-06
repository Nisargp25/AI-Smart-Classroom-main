// craco.config.js
const path = require("path");
require("dotenv").config();

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
configure: (webpackConfig) => {

      // Fix: prevent source-map-loader from failing on missing source maps
      // inside node_modules (e.g. recharts -> nested immer). recharts declares
      // immer as a dependency but it is hoisted, so the nested
      // node_modules/recharts/node_modules/immer/dist/immer.mjs path does not
      // exist. Excluding node_modules from source-map-loader avoids the
      // "Module build failed ... ENOENT" error at build time.
// The source-map-loader rule in CRA can be structured with `use` as
      // either a single object or an array of loaders, so we check both shapes.
      const isSourceMapLoader = (use) => {
        if (!use) return false;
        const items = Array.isArray(use) ? use : [use];
        return items.some(
          (u) => u && u.loader && String(u.loader).includes('source-map-loader')
        );
      };

      webpackConfig.module.rules.forEach((rule) => {
        if (rule && rule.use && isSourceMapLoader(rule.use)) {
          rule.exclude = rule.exclude
            ? [].concat(rule.exclude).concat([/node_modules/])
            : [/node_modules/];
        }
      });

      // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

webpackConfig.devServer = (devServerConfig) => {
  const backendProxyTarget = (
    process.env.BACKEND_PROXY_TARGET
    || process.env.REACT_APP_BACKEND_URL
    || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  // Proxy API calls through the frontend dev server.
  // This allows public tunnel access with only port 4000 forwarded.
  devServerConfig.proxy = [
    {
      context: ["/api"],
      target: backendProxyTarget,
      changeOrigin: true,
      secure: false,
      ws: false,
    },
  ];

  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

module.exports = webpackConfig;
