const path = require('path');

module.exports = {
  entry: {
    app: path.join(process.cwd(), 'src/browser/index.tsx'),
  },
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'tsconfig.json'),
        },
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.join(process.cwd(), 'dist/browser'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  target: 'web',
};
