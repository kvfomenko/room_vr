const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
        {
            host: '192.168.0.93',
            port: '80',
            static: './',
            open: true
        }
    }
)
