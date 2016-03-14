var gulp = require('gulp');
var Elixir = require('laravel-elixir');

var $ = Elixir.Plugins;
var config = Elixir.config;
var _ = require('underscore');

_.mixin({
    deepExtend: require('underscore-deep-extend')(_)
});

$.changed = require('gulp-changed');
$.responsive = require('gulp-responsive');

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

Elixir.extend('images', function(src, output, sizes, options, extnames) {
    config.images = {
        folder: 'images',
        outputFolder: 'img',
        sizes: [544, 768, 992, 1200, null],
        options: {
            quality: 100,
            progressive: true,
            compressionLevel: 9,
            errorOnUnusedConfig: false,
            errorOnUnusedImage: false,
            errorOnEnlargement: false,
        }, extnames: ['webp']
    }

    var sizes = sizes || config.images.sizes;
    var extnames = extnames === null ? extnames : extnames || config.images.extnames;

    _.deepExtend(config.images.options, options);

    var configuration = {};
    configuration[src] = [];

    var baseConfiguration, size, extnamesIndex;

    var sizesIndex = sizes.length
    while (sizesIndex--) {
        size = sizes[sizesIndex];

        baseConfiguration = {}

        if (size) {
            baseConfiguration.rename = {suffix: '-' + size}
            baseConfiguration.width = size;
        }

        configuration[src].push(baseConfiguration);

        if (extnames !== null) {
            extnamesIndex = config.images.extnames.length;
            while (extnamesIndex--) {
                configuration[src].push(_.deepExtend({
                    rename: {
                        extname: '.' + config.images.extnames[extnamesIndex]
                    }
                }, baseConfiguration));
            }
        }
    }

    var paths = prepGulpPaths(src, output);

    new Elixir.Task('images', function() {
        this.log(paths.src, paths.output);

        return (
            gulp
            .src(paths.src.path)
            .pipe($.changed(paths.output.baseDir))
            .pipe($.responsive(configuration, config.images.options)
                .on('error', function(e) {
                    new Elixir.Notification().error(e, 'Images Compilation Failed!');
                    this.emit('end');
                }))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Images Compiled!'))
        );
    })
    .watch(paths.src.path)
});


/**
 * Prep the Gulp src and output paths.
 *
 * @param  {string|Array} src
 * @param  {string|null}  baseDir
 * @param  {string|null}  output
 * @return {GulpPaths}
 */
var prepGulpPaths = function(src, output) {
    return new Elixir.GulpPaths()
        .src(src, config.get('assets.images.folder'))
        .output(output || config.get('public.images.outputFolder'), '.');
}
