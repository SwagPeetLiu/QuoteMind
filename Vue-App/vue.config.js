const path = require('path');
const webpack = require('webpack');

module.exports = {
  transpileDependencies: ['@vuepic/vue-datepicker', 'date-fns'],
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
      })
    ],
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        },
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, 'node_modules/date-fns'),
            path.resolve(__dirname, 'node_modules/@vuepic/vue-datepicker')
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator']
            }
          }
        }
      ]
    }
  }
}