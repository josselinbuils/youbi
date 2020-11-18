const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: path.join(process.cwd(), 'src/browser/index.tsx'),
  mode: isDevelopment ? 'development' : 'production',
  module: {
    rules: [
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
    ],
  },
  output: {
    path: path.join(process.cwd(), 'dist/browser'),
  },
  plugins: [
    isDevelopment && new ReactRefreshPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(process.cwd(), 'src/browser/index.html'),
    }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  target: 'web',
};
