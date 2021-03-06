const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join, resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const {
    DefinePlugin,
    ProvidePlugin
} = require('webpack');

const delphinetHandlerAddress = 'tz1aD8mSP312ZJueP5GDVgo66iqdymYH7Ud8';
const mainnetHandlerAddress = 'tz1NQLupzngYycmbpygd2sWsGwTn5Z7xXjCb';

const nodeModulesPath = resolve(__dirname, './node_modules');
const srcPath = resolve(__dirname, './src');
const distPath = resolve(__dirname, './dist');

module.exports = (env) => {
    const isProd = env.NODE_ENV === 'production';

    return {
        mode: env.NODE_ENV,
        target: 'web',
        entry: {
            main: join(srcPath, 'index.tsx')
        },
        output: {
            filename: isProd ? '[name].[chunkhash].js' : '[name].js',
            path: distPath,
            publicPath: '/'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: isProd ? {
                                compilerOptions: {
                                    declaration: false,
                                    declarationMap: false,
                                    sourceMap: false,
                                    removeComments: true
                                }
                            } : undefined
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    javascriptEnabled: true
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpe?g|png|gif|webp)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: isProd ? '[name].[contenthash].[ext]' : '[name].[ext]',
                                outputPath: 'assets/',
                                publicPath: '/assets'
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CleanPlugin(),
            new DefinePlugin({
                TZFORMS_ENVIRONMENT: JSON.stringify(isProd ? 'production' : 'development'),
                TZFORMS_HANDLER_ADDRESS: JSON.stringify(isProd ? mainnetHandlerAddress : delphinetHandlerAddress),
                TZFORMS_API_URL: JSON.stringify(isProd ? 'https://api.tzforms.com' : 'http://127.0.0.1:8081')
            }),
            new ProvidePlugin({
                Buffer: ['buffer', 'Buffer']
            }),
            new HtmlPlugin({
                template: join(srcPath, 'index.ejs')
            }),
            new MiniCssExtractPlugin({
                filename: isProd ? '[name].[contenthash].css' : '[name].css'
            })
        ],
        resolve: {
            extensions: [
                '.gif',
                '.jpg',
                '.jpeg',
                '.js',
                '.json',
                '.less',
                '.png',
                '.ts',
                '.tsx',
                '.webp'
            ],
            modules: [
                nodeModulesPath,
                srcPath
            ],
            plugins: [
                new TsconfigPathsPlugin()
            ],
            fallback: {
                'buffer': require.resolve('buffer'),
                'crypto': require.resolve('crypto-browserify'),
                'os': require.resolve('os-browserify/browser'),
                'http': require.resolve('stream-http'),
                'https': require.resolve('https-browserify'),
                'path': require.resolve('path-browserify'),
                'stream': require.resolve('stream-browserify')
            }
        },
        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
                new TerserPlugin()
            ],
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            // get the name. E.g. node_modules/packageName/not/this/part.js
                            // or node_modules/packageName
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                            // npm package names are URL-safe, but some servers don't like @ symbols
                            return `vendor~${packageName.replace('@', '')}`;
                        },
                    }
                }
            },
        },
        devtool: 'source-map',
        devServer: {
            contentBase: '/',
            disableHostCheck: true,
            historyApiFallback: true,
            port: 8080,
            publicPath: '/'
        }
    };
}
