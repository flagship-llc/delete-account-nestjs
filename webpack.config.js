require('dotenv').config();
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

let mode = 'production';
let devtool = false;

if (process.env.NODE_ENV == 'development') {
  mode = 'development';
  devtool = 'eval-source-map';
}

const cssLoader = {
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
};

const sassLoader = {
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
};

const babelLoader = {
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: ['babel-loader'],
};

const vueLoader = {
  test: /\.vue$/,
  loader: 'vue-loader',
};

const vueSassLoader = {
  test: /\.scss$/,
  use: ['vue-style-loader', 'css-loader', 'sass-loader'],
};

const tsLoader = {
  test: /\.tsx?$/,
  use: 'ts-loader',
};

module.exports = [
  {
    mode,
    entry: {
      index: path.resolve(__dirname, 'client', 'admin', 'index.tsx'),
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist', 'client', 'admin'),
    },
    module: {
      rules: [cssLoader, sassLoader, babelLoader, tsLoader],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'client', 'admin', 'views'),
            to: path.resolve(__dirname, 'dist', 'client', 'admin', 'views'),
          },
        ],
      }),
    ],
    devtool: 'inline-source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist', 'client', 'admin', 'views'),
      },
      open: true,
      port: 3000,
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    },
  },
];
