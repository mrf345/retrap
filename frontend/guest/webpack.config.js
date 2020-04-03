const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    entry: path.resolve(__dirname, 'build/index.js'),
    output: {
        filename: 'guest.js',
        path: path.resolve(__dirname, '../../build/frontend')
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            parallel: true
        })],
    },
};
