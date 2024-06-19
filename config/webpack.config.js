const path = require('path');


module.exports = {
  entry: {
    content: './main.js',
  },

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../build')
  },
};
