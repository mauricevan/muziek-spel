const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
require('dotenv').config()

module.exports = {
  entry: {
    main: [
      path.resolve(__dirname, 'node_modules/regenerator-runtime/runtime.js'),
      path.resolve(__dirname, 'src/index.tsx')
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    port: 8080,
    hot: true,
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_SPOTIFY_CLIENT_ID': JSON.stringify(process.env.REACT_APP_SPOTIFY_CLIENT_ID),
      'process.env.REACT_APP_REDIRECT_URI': JSON.stringify(process.env.REACT_APP_REDIRECT_URI)
    })
  ]
}
