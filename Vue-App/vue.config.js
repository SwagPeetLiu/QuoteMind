module.exports = {
    transpileDependencies: ['v-calendar'],
    configureWebpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
              /src/,
              /node_modules\/v-calendar/
            ],
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator'
              ]
            }
          }
        ]
      }
    },
    // handle v-calendar separately, excluding from Vue CLI's default loader
    chainWebpack: (config) => {
      config.module
        .rule('js')
        .exclude
          .add(/node_modules\/v-calendar/)
          .end()
    }
  }