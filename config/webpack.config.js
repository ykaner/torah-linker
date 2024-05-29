const path = require('path');


module.exports = {
  entry: {
    content: './dicta_ref_linker.js',
  },

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../build')
  },
};
