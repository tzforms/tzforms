const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join, resolve } = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { dependencies } = require('./package.json');

const nodeModulesPath = resolve(__dirname, './node_modules');
const srcPath = resolve(__dirname, './src');
const distPath = resolve(__dirname, './dist');

module.exports = (env, argv) => {
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
                    exclude: [/node_modules/],
                    use: {
                        loader: 'ts-loader',
                        options: {
                            configFile: tsconfigPath
                        }
                    }
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
                }
            ]
        },
        plugins: [
            new CleanPlugin(),
            new HtmlPlugin({
                template: join(srcPath, 'index.ejs'),
                templateParameters: {
                    cdnAntd: `https://unpkg.com/antd@${dependencies['antd'].match(/(\d+\.?)+/g)[0]}/dist/antd${isProd ? '.min' : ''}.js`,
                    cdnReact: `https://unpkg.com/react@${dependencies['react'].match(/(\d+\.?)+/g)[0]}/umd/react${isProd ? '.production.min' : '.development'}.js`,
                    cdnReactDom: `https://unpkg.com/react-dom@${dependencies['react-dom'].match(/(\d+\.?)+/g)[0]}/umd/react-dom${isProd ? '.production.min' : '.development'}.js`,
                    cdnReactRouterDom: `https://unpkg.com/react-router-dom@${dependencies['react-router-dom'].match(/(\d+\.?)+/g)[0]}/umd/react-router-dom${isProd ? '.min' : ''}.js`
                }
            })
        ],
        resolve: {
            extensions: ['.css', '.js', '.json', '.less', '.ts', '.tsx'],
            modules: [
                nodeModulesPath,
                srcPath
            ],
            plugins: [
                new TsconfigPathsPlugin()
            ]
        },
        externals: {
            'antd': 'antd',
            'react': 'React',
            'react-dom': 'ReactDOM',
            'react-router-dom': 'ReactRouterDOM'
        },
        optimization: {
            minimize: isProd,
            minimizer: [new TerserPlugin()],
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
            historyApiFallback: true,
            port: 8080,
            publicPath: '/'
        }
    };
}