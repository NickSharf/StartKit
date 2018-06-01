'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var mqpacker = require('css-mqpacker');
var minifycss = require('gulp-csso');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');
var rigger = require('gulp-rigger');
var run = require('run-sequence');
var del = require('del');
var ghPages = require('gulp-gh-pages');

// CLEAN BUILD

gulp.task('clean', function(done) {
  return del('build', done);
});

// HTML

gulp.task('html:del', function(done) {
  return del('build/*.html', done);
});

gulp.task('html:copy', function() {
  return gulp.src('*.html')
    .pipe(rigger())
    .pipe(gulp.dest('build'));
});

gulp.task('html', gulp.series('html:del', 'html:copy'));

// CSS

gulp.task('style', function (done) {
  gulp.src('sass/main.scss')
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: require("node-normalize-scss").includePaths
    }))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(minifycss())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
    done()
});

// JS
gulp.task('js:del', function(done) {
  return del('build/js', done);
});

gulp.task('js:libraries', function(done) {
  gulp.src('js/libraries/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('build/js/libraries'))
    .pipe(server.stream());
    done()
});


gulp.task('js:scripts', function(done) {
  gulp.src('js/main.js')
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());
    done()
});

gulp.task('js', gulp.series('js:del', 'js:libraries', 'js:scripts'));

// FONTS

gulp.task('fonts:del', function(done) {
  return del('build/fonts', done);
});

gulp.task('fonts:copy', function(done) {
  return gulp.src('fonts/**/*.{woff,woff2}')
    .pipe(gulp.dest('build/fonts/'));
    done()
});

gulp.task('fonts', gulp.series('fonts:del', 'fonts:copy'));

// FAVICONS

gulp.task('favicons:del', function(done) {
  return del('build/img/favicons', done);
});

gulp.task('favicons:copy', function(done) {
  return gulp.src('img/favicons/*.{png,jpg,json,jpeg,svg}')
    .pipe(gulp.dest('build/img/favicons/'));
    done()
});

gulp.task('favicons', gulp.series('favicons:del', 'favicons:copy'));

// IMAGES

gulp.task('img:del', function(done) {
  return del('build/img/*.*', done);
});

gulp.task('img:copy', function(done) {
  return gulp.src('img/*.{png,jpg,gif,svg}')
    .pipe(gulp.dest('build/img/'));
    done()
});

gulp.task('img:minify', function(done) {
  return gulp.src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
    done()
});

gulp.task('img', gulp.series('img:del', 'img:copy', 'img:minify'));

// WEBP

gulp.task('webp:del', function(done) {
  return del('build/img/content', done);
});

gulp.task('webp:copy', function(done) {
  return gulp.src('img/content/*.{png,jpg}')
    .pipe(gulp.dest('build/img/content'));
    done()
});

gulp.task('webp:convert', function(done) {
  return gulp.src('build/img/content/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img/content'));
    done()
});
;
gulp.task('webp', gulp.series('webp:del', 'webp:copy', 'webp:convert'));


// SVG-SPRITE

gulp.task('svg-sprite:del', function(done) {
  return del('build/img/svg-sprite');
  done()
});

gulp.task('svg-sprite:copy', function(done) {
  return gulp.src('img/svg-sprite/*.svg')
    .pipe(gulp.dest('build/img/svg-sprite'))
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
    done()
});

gulp.task('svg-sprite', gulp.series('svg-sprite:del', 'svg-sprite:copy'));

//GH-PAGES

gulp.task('deploy', function(done) {
  return gulp.src('build/**/*')
    .pipe(ghPages());
    done()
});

// LIVE SERVER

gulp.task('reload', function(done){
  server.reload();
  done();
});

gulp.task('serve', function(done) {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('sass/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('*.html', gulp.series('html', 'reload'));
  gulp.watch('js/scripts/*.js', gulp.series('js', 'reload'));
  done()
});

// BUILD

gulp.task('build', gulp.series('clean',
  gulp.parallel(
    'html',
    'style',
    'js',
    'fonts',
    'favicons',
    'img',
    'webp',
    'svg-sprite'
  )
));
