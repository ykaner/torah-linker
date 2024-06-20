const path = require('path');


module.exports = {
  entry: {
    content: './content_script.js',
  },

  output: {
    filename: 'content_script.js',
    path: path.resolve(__dirname, '../build')
  },
};
