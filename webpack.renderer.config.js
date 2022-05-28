const path = require('path');
const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');

function srcPaths(src) {
  return path.join(__dirname, src);
}

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    alias: {
      '@': srcPaths('src'),
      '@client': srcPaths('src/client'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
