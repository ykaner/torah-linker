const path = require('path');

module.exports = {
  entry: {
    content_script: './content_script.js',
    popup: './popup.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, '../build')
  }
};
