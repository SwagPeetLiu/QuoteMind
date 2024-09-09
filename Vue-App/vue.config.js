const path = require('path');

module.exports = {
  transpileDependencies: ['@vuepic/vue-datepicker', 'date-fns'],
  configureWebpack: {
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