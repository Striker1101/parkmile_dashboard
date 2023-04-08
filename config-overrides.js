const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  config.ignoreWarnings = [/Failed to parse source map/];
  Object.assign(fallback, {
    assert: require.resolve("assert"),
    buffer: require.resolve("buffer"),
    console: require.resolve("console-browserify"),
    constants: require.resolve("constants-browserify"),
    crypto: require.resolve("crypto-browserify"),
    domain: require.resolve("domain-browser"),
    events: require.resolve("events"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    punycode: require.resolve("punycode"),
    process: require.resolve("process/browser"),
    querystring: require.resolve("querystring-es3"),
    stream: require.resolve("stream-browserify"),
    string_decoder: require.resolve("string_decoder"),
    sys: require.resolve("util"),
    timers: require.resolve("timers-browserify"),
    tty: require.resolve("tty-browserify"),
    url: require.resolve("url"),
    util: require.resolve("util"),
    fs: false,
    vm: require.resolve("vm-browserify"),
    zlib: require.resolve("browserify-zlib"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  return config;
};
