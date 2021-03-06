import path from 'path'
import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'


const config = {
  entry: './index.js',

  output: {
    filename: 'main.[hash].js',
    path: path.join(__dirname, 'build'),
    libraryTarget: 'umd',
  },

  externals: [
    'react-dom/server',
  ],

  devtool: 'source-map',

  module: {
    loaders: [
      {
        test: /\.less$/,
        include: path.resolve(__dirname, 'site'),
        loader: 'css!autoprefixer!less',
      },
      {
        test: /\.less$/,
        include: path.resolve(__dirname, 'songs'),
        loader: 'css!autoprefixer!less',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel'],
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
      {
        test: /\.svg$|\.woff$/,
        loader: 'url',
      },
      {
        test: /.png$/,
        loader: 'file?name=[name].[hash].[ext]',
      },
      {
        test: /\.mid$|\.wav$|\.mp3$/,
        loader: 'file?name=[path][name].[hash].[ext]',
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.GA_ID': JSON.stringify(process.env.GA_ID),
    }),
    new StaticSiteGeneratorPlugin('main', ['/']),
  ],
}

if (process.env.NODE_ENV === 'production') {
  const lessLoader = config.module.loaders[0]
  lessLoader.loader = ExtractTextPlugin.extract(lessLoader.loader)
  config.plugins.push(new ExtractTextPlugin('main.[contenthash].css'))
}

export default config
