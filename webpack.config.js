const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  devServer: {
    host: '0.0.0.0',
    contentBase: './'
  },
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.css', ],
  },
  output: {
    publicPath: './',
    filename: 'dist/bundle.js',
    path: path.resolve(__dirname, './'),
  },
  plugins: [new HtmlWebpackPlugin()]
}
