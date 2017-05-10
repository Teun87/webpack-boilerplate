var webpack = require('webpack');
var glob = require('glob');
var path = require('path');

// Extract CSS
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// Setup two instances of ExtractTextPlugin for individual tests.
var extractSCSS = new ExtractTextPlugin('[name].[chunkhash].css');
var extractCSS = new ExtractTextPlugin('[name].[chunkhash].css');

var HTMLExtractor = new ExtractTextPlugin('[name].twig');

// Lint CSS
var StyleLintPlugin = require('stylelint-webpack-plugin');

var CleanWebpackPlugin = require('clean-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

// Plugin for creating svg sprites
////var SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
var SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

// Flag to check the node environment
var inProduction = (process.env.NODE_ENV === 'production');

//var PurifyCSSPlugin = require('purifycss-webpack');
//var HtmlWebpackPlugin = require('html-webpack-plugin');
//var InlineChunkManifestHtmlWebpackPlugin = require('inline-chunk-manifest-html-webpack-plugin');

module.exports = {
    entry: {
        app: [
            __dirname + '/craft/templates/src/js/main.js',
            // Post CSS
            __dirname + '/craft/templates/src/css/main.post.css'
        ],
        // Sass
        extraSassTest: [__dirname + '/craft/templates/src/scss/sass-styling.scss'],
        // todo: why is svgxuse being exported to /template-images
        vendor: ['jquery', 'vue', 'svgxuse']
    },
    output: {
        path: path.resolve(__dirname + '/public/dist/'),
        // Chunkhash instead of hash, to prevent renaming all files if one changes
        filename: '[name].[chunkhash].js'
    },
    module: {
        rules: [

            // (Post)CSS
            {
                test: /\.css$/,
                use: extractCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                autoprefixer: false,
                                sourceMap: true,
                                importLoaders: 1
                            }
                        },
                        'postcss-loader',
                        //This loader will automatically fix whatever it can in your stylesheets before pre-processing them
                        // {
                        //     loader: "stylefmt-loader",
                        //     options: {
                        //         config: "stylelint.config.js"
                        //     }
                        // },
                    ],
                })
            },

            // SASS
            {
                test: /\.scss$/,
                use: extractSCSS.extract({
                    use : [
                        {
                            loader: 'css-loader',
                            // options: {url: false}
                        },
                        'sass-loader',
                        'resolve-url-loader',
                        'sass-loader?sourceMap'
                    ],
                    fallback: 'style-loader'
                })
            },

            // TWIG
            {
                test: /\.twig$/,
                loader: HTMLExtractor.extract({ use: 'html-loader' })
            },

            // JS
            {
                test: /\.js$/,
                exclude: __dirname + '/node_modules/',
                use: 'babel-loader'
            },

            // Vue
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },

            // FONTS: Base setup for webfonts, caution: does not copy svg-format
            {
                test: /\.eot|ttf|woff|woff2$/,
                loader: 'file-loader',
                options: {name: './fonts/[name].[ext]'}
            },

            // SVG
            // Best option for now is to manually create the sprite via icomoon.io and place it in the
            // icons-folder.
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                include: path.resolve(__dirname + '/craft/templates/src/icons'),
                options: {
                    extract: true,
                    spriteModule: '/craft/templates/src/icons'
                }
            },

            // IMAGES
            {
                test: /\.png|jpg|gif$/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: './template-images/[name].[ext]'
                        }
                    },
                    // Optimize images with RELATIVE path which are used in the CSS files (only if in production env)
                    {
                        loader: 'img-loader',
                        options: {
                            enabled: inProduction,
                        }
                    }
                ]
            }
        ]
    },
    plugins: [

        HTMLExtractor,

        new SpriteLoaderPlugin(),

        new BrowserSyncPlugin({
            // browse to http://localhost:3000/ during development,
            // ./public directory is being served
            notify: false,
            open: false,
            proxy: 'http://webpack-base.dev',
            files: [
                'craft/templates/**/*.twig',
                'public/assets/dist/**/*.js',
                'public/assets/dist/**/*.css'
            ]
        }),

        // Extract CSS and optionally minimize it.
        extractCSS,
        extractSCSS,
        new webpack.LoaderOptionsPlugin({
           minimize: inProduction
        }),

        // Lint CSS
        new StyleLintPlugin({
            files: 'craft/templates/**/*.?(s)?(a|c)ss',
            emitErrors: false,
            // not working: quiet: true
        }),

        // Optional Clean plugin
        new CleanWebpackPlugin(['public/dist'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),

        // Plugin to return the new hashed file-names for JS/CSS
        new ManifestPlugin(),

        // Insert chuck hash files into the HTML
        // new HtmlWebpackPlugin({
        //     template: './index.html'
        // }),
        // // InlineChunkManifestHtmlWebpackPlugin defaults to:
        // // { filename: 'manifest.json', manifestVariable: 'webpackManifest', chunkManifestVariable: 'webpackChunkManifest', dropAsset: false }
        // new InlineChunkManifestHtmlWebpackPlugin(),

        // Optional CSS purifier
        // new PurifyCSSPlugin({
        //     // Give paths to parse for rules. These should be absolute!
        //     paths: glob.sync(path.join(__dirname, 'index.html')),
        //     minimize: inProduction
        // }),

        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: Infinity
        }),

        // Make jQuery work with Webpack. Only include if jQuery is necessary
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })

    ],

    // Select full version of vue instead of the (default) runtime-only build
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }

};

// If production minify JS
if(inProduction){
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    )
}