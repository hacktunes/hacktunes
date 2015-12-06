import path from 'path'
import webpack from 'webpack'
import StaticSiteGeneratorPlugin from 'static-site-generator-webpack-plugin'

const config = {
  entry: './index.js',

  output: {
    filename: 'main.[hash].js',
    path: path.join(__dirname, 'build'),
    libraryTarget: 'umd'
  },

  externals: [
    './site/server',
  ],

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
      },
      {
        test: /\/static\/favicon\.png$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.mid$/,
        loader: 'file?name=[path][name].[hash].[ext]',
      },
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new StaticSiteGeneratorPlugin('main', ['/'], {data: {}}),
  ],
}

export default config
