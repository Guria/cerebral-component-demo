var path = require('path')

module.exports = {
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader'
      }
    ],
    loaders: [
      { test: /\.p?css$/, loader: "style!css!postcss" }
      // { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  },
  postcss: function () {
    return [
      require('postcss-nested')
    ]
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  }
}
