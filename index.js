var gulp = require('gulp');
var Elixir = require('laravel-elixir');

var $ = Elixir.Plugins;
var config = Elixir.config;

$.responsive = require('gulp-responsive');

/*
 |----------------------------------------------------------------
 | Nunjucks Compilation
 |----------------------------------------------------------------
 |
 | This task offers a simple way to render your Nunjucks assets.
 | You can either render a single file or a entire directory.
 | Don't forget the path if you specify alternate options.
 |
 */

Elixir.extend('images', function(src, output, sizes, options) {
    config.images = {
        folder: 'images',
        outputFolder: 'img',
        sizes: {
            '**/*': [{
                width: 544,
                rename: {suffix: '-544'}
            }, {
                width: 768,
                rename: {suffix: '-768'}
            }, {
                width: 992,
                rename: {suffix: '-992'}
            }, {
                width: 1200,
                rename: {suffix: '-1200'}
            }, {
                // Empty object copies original image
            }]
        }, options: {
            quality: 50,
            progressive: true
        }
    };

    var paths = prepGulpPaths(src, output);

    new Elixir.Task('images', function() {
        this.log(paths.src, paths.output);

        return (
            gulp
            .src(paths.src.path)
            .pipe($.responsive(sizes || config.images.sizes, options || config.images.options)
                .on('error', function(e) {
                    new Elixir.Notification().error(e, 'Images Compilation Failed!');
                    this.emit('end');
                }))
            .pipe(gulp.dest(paths.output.baseDir))
            .pipe(new Elixir.Notification('Images Compiled!'))
        );
    })
    .watch()
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