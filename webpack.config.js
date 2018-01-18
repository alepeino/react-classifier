const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    library: 'ReactClassifier',
    libraryTarget: 'umd'
  },
  externals: {
    react: {
      root: 'React',
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react'
    }
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          'plugins': ['lodash'],
          'presets': [['react-app']]
        }
      }
    ]
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new UglifyJsPlugin()
  ]
}
