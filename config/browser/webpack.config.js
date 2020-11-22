const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: path.join(process.cwd(), 'src/browser/index.tsx'),
  mode: isDevelopment ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.module\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.module\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: false },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          isDevelopment && {
            loader: 'babel-loader',
            options: {
              plugins: ['react-refresh/babel'],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              configFile: path.join(__dirname, 'tsconfig.json'),
            },
          },
        ].filter(Boolean),
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
    ],
  },
  output: {
    path: path.join(process.cwd(), 'dist/browser'),
    publicPath: '/',
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(process.cwd(), 'src/browser/index.html'),
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.scss', '.ts', '.tsx'],
  },
  target: 'web',
};
