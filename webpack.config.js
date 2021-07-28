const path = require('path');

module.exports = {
    mode: 'development', // 'development' | 'production'
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            name: 'lexifer',
            type: 'var'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devtool: false
};