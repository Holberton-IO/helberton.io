// const path = require('path');
//
// module.exports = {
//   entry: './src/app.js',
//   output: {
//     filename: 'bundle.js',
//     path: path.resolve(__dirname, 'static'),
//   },
// };

// const path = require('path');
//
// module.exports = (env, argv) => {
//   const isProduction = argv.mode === 'production';
//
//   return {
//     entry: './src/app.js',
//     output: {
//       filename: 'bundle.js',
//       path: path.resolve(__dirname, 'static'),
//     },
//     optimization: {
//       minimize: isProduction,
//       minimizer: [],
//     },
//   };
// };

const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // Get the current date and time
  const buildTime = new Date().toLocaleString();

  return {
    entry: './src/app.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'static'),
    },
    optimization: {
      minimize: isProduction,
      minimizer: [],
    },
    plugins: [
      new webpack.DefinePlugin({
        // 'process.env.BUILD_TIME':buildTime,
        'process.env.BUILD_TIME': JSON.stringify(buildTime),
      }),
    ],
  };
};
