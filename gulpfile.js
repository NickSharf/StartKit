'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
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

gulp.task('html:copy', function(done) {
  return gulp.src('src/*.html')
    .pipe(posthtml([include()]))
    .pipe(gulp.dest('build'));
    done();
});

gulp.task('html', gulp.series('html:del', 'html:copy'));

// CSS

gulp.task('style', function (done) {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
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
    .pipe(sourcemaps.write())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
    done();
});

// JS
gulp.task('js:del', function(done) {
  return del('build/js', done);
});

gulp.task('js:vendor', function(done) {
  return gulp.src('src/js/vendor/*.js')
    .pipe(plumber())
    .pipe(gulp.dest('build/js/vendor'))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());Е
    done();
});


gulp.task('js:modules', function(done) {
  return gulp.src('src/js/modules/*.js')
    .pipe(plumber())
    .pipe(gulp.dest('build/js/modules'))
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream());
    done();
});

gulp.task('js', gulp.series('js:del', 'js:vendor', 'js:modules'));

// FONTS

gulp.task('fonts:del', function(done) {
  return del('build/fonts', done);
});

gulp.task('fonts:copy', function(done) {
  return gulp.src('src/fonts/**/*.{woff,woff2}')
    .pipe(gulp.dest('build/fonts/'));
    done();
});

gulp.task('fonts', gulp.series('fonts:del', 'fonts:copy'));

// FAVICONS

gulp.task('favicons:del', function(done) {
  return del('build/img/favicons', done);
});

gulp.task('favicons:copy', function(done) {
  return gulp.src('src/img/favicons/*.{png,jpg,json,jpeg,svg}')
    .pipe(gulp.dest('build/img/favicons/'));
    done();
});

gulp.task('favicons', gulp.series('favicons:del', 'favicons:copy'));

// IMAGES

gulp.task('img:del', function(done) {
  return del('build/img/*.*', done);
});

gulp.task('img:copy', function(done) {
  return gulp.src('src/img/*.{png,jpg,gif,svg}')
    .pipe(gulp.dest('build/img/'));
    done();
});

gulp.task('img:minify', function(done) {
  return gulp.src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
    done();
});

gulp.task('img', gulp.series('img:del', 'img:copy', 'img:minify'));

// CONTENT IMAGES

gulp.task('content:del', function(done) {
  return del('build/img/content', done);
});

gulp.task('content:copy', function(done) {
  return gulp.src('src/img/content/*.{png,jpg}')
    .pipe(gulp.dest('build/img/content'));
    done();
});

gulp.task('content:convert', function(done) {
  return gulp.src('build/img/content/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img/content'));
    done();
});
;
gulp.task('content', gulp.series('content:del', 'content:copy', 'content:convert'));


// SVG-SPRITE

gulp.task('svg-sprite:del', function(done) {
  return del('build/img/svg-sprite');
  done();
});

gulp.task('svg-sprite:copy', function(done) {
  return gulp.src('src/img/svg-sprite/*.svg')
    .pipe(gulp.dest('build/img/svg-sprite'))
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img/svg-sprite'));
    done();
});

gulp.task('svg-sprite', gulp.series('svg-sprite:del', 'svg-sprite:copy'));

//GH-PAGES

gulp.task('deploy', function(done) {
  return gulp.src('build/**/*')
    .pipe(ghPages());
    done();
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

  gulp.watch('src/scss/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('src/*.html', gulp.series('html', 'reload'));
  gulp.watch('src/components/*.html', gulp.series('html', 'reload'));
  gulp.watch('src/js/**/*.js', gulp.series('js', 'reload'));
  done();
});

// BUILD

gulp.task('build', gulp.series('clean',
  gulp.series(
    'html',
    'style',
    'js',
    'fonts',
    'favicons',
    'img',
    'content',
    'svg-sprite'
  )
));
