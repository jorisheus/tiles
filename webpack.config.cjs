//webpack.config.js
const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = env => {
  let envPath = `./.env`
  return {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'tiles.js' // <--- Will be compiled to this single file
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new Dotenv({
        path: envPath
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    }
  }
}