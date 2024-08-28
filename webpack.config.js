const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js'   ,
    popup:'./src/popup.js'
 // Add entry point for content script
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'src/images',
          to: 'images',
        },
        {
          from: 'src/popup.html',
          to: 'popup.html',
        }
      ],
    }),
  ],
};
