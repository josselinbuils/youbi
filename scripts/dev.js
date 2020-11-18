const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('../config/browser/webpack.config.js');

const PORT = 3000;

const compiler = webpack(config);
const serverConfig = {
  contentBase: path.join(process.cwd(), 'dist'),
  hot: true,
};
const server = new WebpackDevServer(compiler, serverConfig);

server.listen(PORT, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Webpack Dev Server listening on port ' + PORT);
  }
});
