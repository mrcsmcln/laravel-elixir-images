var gulp = require('gulp');
var Elixir = require('laravel-elixir');

var $ = Elixir.Plugins;
var config = Elixir.config;
var _ = require('underscore');

_.mixin({
    deepExtend: require('underscore-deep-extend')(_)
});

$.changed = require('gulp-changed');
$.filter = require('gulp-filter');
$.if = require('gulp-if');
$.responsive = require('gulp-responsive');

var lazypipe = require('lazypipe');

/*
 |----------------------------------------------------------------
 | Images Compilation
 |----------------------------------------------------------------
 |
 | This task offers an easy way to minify and resize any images.
 | You can either render a single file or a entire directory.
 | Don't forget the path if you specify alternate options.
 |
 */

Elixir.extend('images', function(src, output, options) {
    config.images = _.deepExtend({
        folder: 'images',
        outputFolder: 'img',
        sizes: [[], [1200], [992], [768], [544]],
        webp: true,
        lossy: false,
        optimize: false,
        extensions: {
            lossy: {
                gif: {
                    interlaced: true,
                    lossy: 80,
                    optimize: 3,
                }, jpg: {
                    max: 80,
                    progressive: true
                }, png: {
                    quality: 80,
                    speed: 1
                }, svg: {
                    plugins: [{
                        cleanupIDs: false
                    }, {
                        removeDimensions: true
                    }, {
                        removeUselessDefs: false
                    }]
                }, webp: {
                    lossless: false,
                    method: 6,
                    quality: 80
                }
            }, lossless: {
                gif: {
                    interlaced: true
                }, jpg: {
                    progressive: true
                }, png: {
                    optimizationLevel: 7
                }, svg: {
                    plugins: [{
                        cleanupIDs: false
                    }, {
                        removeDimensions: true
                    }, {
                        removeUselessDefs: false
                    }]
                }, webp: {
                    lossless: true,
                    method: 6
                }
            }
        }, optimizers: {
            lossy: {
                gif: require('imagemin-giflossy'),
                jpg: require('imagemin-jpegoptim'),
                png: require('imagemin-pngquant'),
                svg: require('imagemin-svgo'),
                webp: require('imagemin-webp')
            }, lossless: {
                gif: require('imagemin-gifsicle'),
                jpg: require('imagemin-jpegtran'),
                png: require('imagemin-optipng'),
                svg: require('imagemin-svgo'),
                webp: require('imagemin-webp')
            }
        }, responsive: {
            quality: 100,
            compressionLevel: 9,
            errorOnUnusedConfig: false,
            errorOnUnusedImage: false,
            errorOnEnlargement: false,
            stats: false,
            silent: true
        }
    }, config.images || {});

    options = {
        responsive: options && options.responsive || config.images.responsive,
        optimizers: options && options.optimizers || config.images.optimizers,
        extensions: options && options.extensions || config.images.extensions,
        sizes: options && options.sizes || config.images.sizes,
        lossy: options && options.lossy || config.images.lossy,
        webp: options && options.webp || config.images.webp
    };

    var sizesIndex = options.sizes.length;
    var configuration = {
        '**/*': []
    };

    while (sizesIndex--) {
        var size = options.sizes[sizesIndex];
        var baseConfiguration = {}

        if (size.length) {
            var width = size[0];
            var height = size[1];

            baseConfiguration.width = width;
            baseConfiguration.rename = {
                suffix: '-' + width
            }
            
            if (height) {
                baseConfiguration.height = height;
                baseConfiguration.rename.suffix += 'x' + height;
            }
            
            baseConfiguration.crop = size[2] || false;
        }

        configuration['**/*'].push(baseConfiguration);

        if (options.webp) {
            configuration['**/*'].push(_.deepExtend({
                rename: {
                    extname: '.webp'
                }
            }, baseConfiguration));
        }
    }

    var paths = prepGulpPaths(src, output);

    new Elixir.Task('images', function() {
        this.log(paths.src, paths.output);

        var imageminPipe = lazypipe();

        Object.keys(config.images.optimizers.lossy).forEach(function (value, index) {
            var filter = $.filter('**/*.' + value, {
                restore: true,
                passthrough: false
            });

            imageminPipe = imageminPipe
                .pipe(function () {
                    return filter;
                }).pipe(function () {
                    var optimizers = options.lossy ? options.optimizers.lossy : options.optimizers.lossless;
                    var extensions = options.lossy ? options.extensions.lossy : options.extensions.lossless;

                    return optimizers[value](extensions[value])()
                        .on('error', function(e) {
                            new Elixir.Notification().error(e, 'Images Compilation Failed!');
                            this.emit('end');
                        })
                    ;
                }).pipe(function () {
                    return filter.restore;
                })
            ;
        });

        var responsiveFilter = $.filter(['**/*', '!**/*.{gif,svg}'], {
            restore: true,
            passthrough: false
        });

        var responsivePipe = lazypipe()
            .pipe(function () {
                return responsiveFilter;
            }).pipe(function () {
                return $.responsive(configuration, options.responsive)
                    .on('error', function(e) {
                        new Elixir.Notification().error(e, 'Images Compilation Failed!');
                        this.emit('end');
                    })
                ;
            }).pipe(function () {
                return responsiveFilter.restore;
            })
        ;

        return gulp
            .src(paths.src.path)
            .pipe($.if(!config.production, $.changed(paths.output.baseDir)))
            .pipe(responsivePipe())
            .pipe($.if(config.images.optimize || config.production, imageminPipe()))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Images Compiled!'))
        ;
    })
    .watch(paths.src.path)
});


/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|Array} src
 * @param  {string|null}  output
 * @return {GulpPaths}
 */
var prepGulpPaths = function(src, output) {
    src = src || '.';
    
    return new Elixir.GulpPaths()
        .src(src, config.get('assets.images.folder'))
        .output(output || config.get('public.images.outputFolder'), '.')
    ;
};
