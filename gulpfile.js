/** ===========================================================================
 *
 * Gulp configuration file.
 *
 * ========================================================================= */





'use strict';





/** ---------------------------------------------------------------------------
 * Load plugins.
 * ------------------------------------------------------------------------- */

var gulp = require('gulp'),
    browser = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    minifyJS = require('gulp-uglify'),
    concatJS = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    imagemin = require('gulp-imagemin'),
    svgSprites = require('gulp-svg-sprites'),
    sequence = require('run-sequence'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify');





/** ---------------------------------------------------------------------------
 * Regular tasks.
 * ------------------------------------------------------------------------- */

// Create a server with BrowserSync and watch for file changes.
gulp.task('server', function() {
    browser.init({
        // Inject CSS changes without the page being reloaded.
        injectChanges: true,

        // What to serve.
        server: {
            baseDir: "dist"
        },

        // The port.
        port: 1234

        // For a complete list of options, visit: https://www.browsersync.io/docs/options
    });

    // Watch for file changes.
    gulp.watch('src/*.html', ['watch-html']);
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/js/lib/**/*.js', ['watch-js']);
    gulp.watch(['src/img/**/*.{png,jpg,gif,svg,ico}', '!src/img/sprites/**'], ['watch-img']);
    gulp.watch('src/img/sprites/**', ['sprites']);
});

// Copies HTML from src to dist.
gulp.task('html', function() {
    return gulp
        .src('src/*.html')
        .pipe(gulp.dest('dist'));
});

// Compiles Sass to CSS.
gulp.task('sass', function() {
    return gulp
        .src('src/scss/**/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError({
                title: 'Gulp error in the <%= error.plugin %> plugin',
                message: '<%= error.message %>'
            })
        }))
        .pipe(sass({
            // Sass related options go here.
            // See more options here: https://github.com/sass/node-sass#options
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie 6-8']
        }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browser.stream());
});

// Concatenate and minify JS.
gulp.task('js', ['lint-js'], function() {
    return gulp
        .src('src/js/lib/**/*.js')
        .pipe(concatJS('scripts.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(minifyJS({
            // For options visit: https://github.com/mishoo/UglifyJS2#minify-options
        }))
        .pipe(rename('scripts.min.js'))
        .pipe(gulp.dest('dist/js'));
});

// Check JS code for errors.
gulp.task('lint-js', function() {
    return gulp
        .src('src/js/lib/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail')); // task fails on JSHint error
});

// Compresses images.
gulp.task('img',  function() {
    return gulp
        .src(['src/img/**/*.{png,jpg,gif,svg,ico}', '!src/img/sprites/**'])
        .pipe(imagemin({
            verbose: true
        }))
        .pipe(gulp.dest('dist/img'));
});

// Creates sprites from SVG files.
gulp.task('sprites', function() {
    return gulp
        .src('src/img/sprites/**/*.svg')
        .pipe(svgSprites({
            cssFile: 'scss/_sprites.scss',
            templates: {
                scss: true
            },
            preview: false,
            svg: {
                sprite: 'img/sprite.svg'
            }
        }))
        .pipe(gulp.dest('src'));
});

// Deletes the dist folder so the build can start fresh.
gulp.task('reset', function() {
    return gulp
        .src('dist')
        .pipe(clean());
});




/** ---------------------------------------------------------------------------
 * Watch tasks.
 * ------------------------------------------------------------------------- */

// HTML.
gulp.task('watch-html', ['html'], function(done) {
    browser.reload();
    done();
});

// Images.
gulp.task('watch-img', ['img'], function(done){
    browser.reload();
    done();
});

// JS.
gulp.task('watch-js', ['js'], function(done) {
    browser.reload();
    done();
});





/** ---------------------------------------------------------------------------
 * The main task.
 * ------------------------------------------------------------------------- */
gulp.task('default', function(cb) {
    sequence('reset', 'html', 'sprites', ['sass', 'img', 'js'], 'server', cb);
});
