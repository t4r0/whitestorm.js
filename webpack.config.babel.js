import path from 'path';
import webpack from 'webpack';
import HappyPack from 'happypack';

process.env.BABEL_ENV = 'browser';

export function config({isProduction, frameworkSrc, frameworkDest}) {
  console.log(isProduction ? 'Production mode' : 'Development mode');

  const loadersSection = [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      happy: { id: 'js' }
    }
  ];

  const pluginsSection = isProduction
  ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      compress: {
        warnings: false
      }
    }),
    new HappyPack({loaders: ['babel', 'string-replace'], threads: 4})
  ]
  : [
    new HappyPack({loaders: ['babel', 'string-replace'], threads: 4})
  ];

  return [{ // PHYSICS VERSION
    devtool: isProduction ? 'hidden-source-map' : 'source-map',
    entry: ['babel-polyfill', `${frameworkSrc}/index.js`],
    target: 'web',
    output: {
      path: path.join(__dirname, frameworkDest),
      filename: 'whitestorm.js',
      library: 'WHS',
      libraryTarget: 'umd'
    },
    module: {
      loaders: loadersSection
    },
    plugins: pluginsSection
  }, { // LIGHT VERSION
    devtool: isProduction ? 'hidden-source-map' : 'source-map',
    entry: ['babel-polyfill', `${frameworkSrc}/index.js`],
    target: 'web',
    output: {
      path: path.join(__dirname, frameworkDest),
      filename: 'whitestorm.light.js',
      library: 'WHS',
      libraryTarget: 'umd'
    },
    module: {
      preLoaders: [{
        test: /\.js$/,
        loader: 'string-replace',
        query: {
          multiple: [
            {
              search: 'physics/index.js\';',
              replace: 'physics/nophysi.js\';'
            },
            {
              search: '!!\'physics\'',
              replace: 'false',
              flags: 'g'
            }
          ]
        }
      }],
      loaders: loadersSection
    },
    plugins: pluginsSection
  }];
}
