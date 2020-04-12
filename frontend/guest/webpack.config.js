const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')


module.exports = {
    entry: path.resolve(__dirname, 'build/main.js'),
    output: {
        filename: 'guest.js',
        path: path.resolve(__dirname, '../../build/frontend')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {loader: 'babel-loader'}}]},
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {ecma: 6}
            })
        ]
    }
}
