const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const env_file = './.env';

module.exports = [
  {
    target: 'web',
    entry: {
      index: './src/index.js',
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
    },
    plugins: [
      new Dotenv({
        path: env_file,
      }),
      new HtmlWebpackPlugin({
        inject: true,
        chunks: ['index'],
        template: 'src/index.html',
        filename: 'index.html',
      }),
    ],
    mode: 'development',
    devtool: false,
  }
]
;