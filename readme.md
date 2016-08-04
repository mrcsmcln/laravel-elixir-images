# Laravel Elixir Images

This Laravel Elixir extension makes resizing and optimizing images a breeze. It depends on `gulp-responsive`, which depends on [sharp](https://www.npmjs.com/package/sharp). Please make sure sharp is installed before attempting to install this extension.

## Usage

Use it like this:

```
gulp images
```

The `--production` flag, or the `optimize` option, will engage image optimization in addition to resizing. Works with `gulp watch`, too.

## Installation

First, pull in the extension through NPM.

```
npm install --save laravel-elixir-images
```

Next, add it to your Elixir-enhanced Gulpfile, like so:

```js
var elixir = require('laravel-elixir');

require('laravel-elixir-images');

elixir(function(mix) {
   mix.images(null);
});
```

That's it! You're all set to go!

## Usage

Assuming you write...

```js
elixir(function(mix) {
    mix.images(null);
});
```

...this will compile images in `resources/assets/images` to `public/img`.

If you'd like to set a different output directory, you may pass a second argument to the `images()` method, like so:

```js
mix.images(null, 'public/images')
```

Finally, if you want to override the images plugin options, you may pass an object as the third argument.

```js
mix.images(null, null, {});

// See options at:
//  https://github.com/mrcsmcln/laravel-elixir-images/blob/master/index.js#L31
//  https://github.com/mahnunchik/gulp-responsive
//  https://www.npmjs.com/browse/keyword/imageminplugin
```

### Sizes

You can specify different size settings like so:

```js
mix.images('image.jpg', null, {
    sizes: [[], [1920], [1280, 720], [640, 480, 'west']]
})
```

The above code will generate four sizes of the original `image.jpg`:

1. `image.jpg`, optimized-only
2. `image-1920.jpg`, optimized and resized to 1920w
3. `image-1280x720.jpg`, optimized, resized, and cropped to 1280x720
4. `image-640x480.jpg`, optimized, resized, and cropped to 640x480, with a western crop gravity

### Optimizers

You can use different optimizers instead of the default (lossless) ones:

```js
mix.images('image.jpg', null, {
    optimizers: {
        jpg: require('imagemin-jpegoptim')
    }
})
```

It's probably recommended that you use lossy optimizers; lossless ones are included for the sake of the [POLA](https://en.wikipedia.org/wiki/Principle_of_least_astonishment). Find more optimizers [here](https://www.npmjs.com/browse/keyword/imageminplugin).

### Extensions

You can change the options of the various image optimizers like so:

```js
mix.images('image.jpg', null, {
    extensions: {
        jpg: {
            progressive: true,
            max: 50
        }
    }
})
```

### WebP

You can turn off WebP output with the following option:

```js
mix.images(null, null, {
    webp: false
})
```
