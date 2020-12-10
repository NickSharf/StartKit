'use strict';

import gulp from 'gulp';
import sass from 'gulp-dart-sass';
import sassGlob from 'gulp-sass-glob';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import posthtml from "gulp-posthtml";
import include from "posthtml-include";
import mqpacker from 'css-mqpacker';
import minifycss from 'gulp-csso';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import ghPages from 'gh-pages';
import browsersync from 'browser-sync';
const server = browsersync.create();
const {src, dest, watch, series, parallel} = gulp;

// CLEAN BUILD

export const clean = () => {
  return del('build');
}

// HTML

const htmldel = () => {
  return del('build/*.html');
}

const htmlcopy = () => {
  return src('src/*.html')
    .pipe(posthtml([include()]))
    .pipe(dest('build'));
}

export const html = series(htmldel, htmlcopy);

// CSS

export const style = () => {
  return src('src/scss/main.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: ['node_modules/normalize.css/']
    }))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(rename('style.css'))
    .pipe(dest('build/css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write())
    .pipe(rename('style.min.css'))
    .pipe(dest('build/css'))
    .pipe(server.stream());
}

// JS
const jsdel = () => {
  return del('build/js');
}

const jsvendor = () => {
  return src('src/js/vendor/*.js')
    .pipe(plumber())
    .pipe(dest('build/js/vendor'))
    .pipe(concat('vendor.js'))
    .pipe(dest('build/js'))
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(dest('build/js'))
}

const jsmodules = () => {
  return src('src/js/modules/*.js')
    .pipe(plumber())
    .pipe(dest('build/js/modules'))
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(dest('build/js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(rename('main.min.js'))
    .pipe(dest('build/js'))
}

export const js = series(jsdel, jsvendor, jsmodules);
// FONTS

const fontsdel = () => {
  return del('build/fonts');
}

const fontscopy = () => {
  return src('src/fonts/**/*.{woff,woff2}')
    .pipe(dest('build/fonts/'));
}

export const fonts = series(fontsdel, fontscopy);

// FAVICONS

const faviconsdel = () => {
  return del('build/img/favicons');
}

const faviconscopy = () => {
  return src('src/img/favicons/*.{png,jpg,json,jpeg,svg}')
    .pipe(dest('build/img/favicons/'));
}

export const favicons = series(faviconsdel, faviconscopy);

// IMAGES

const imgdel = () => {
  return del('build/img/*.*');
}

const imgcopy = () => {
  return src('src/img/*.{png,jpg,gif,svg}')
    .pipe(dest('build/img/'));
}

const imgminify = () => {
  return src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(dest('build/img'));
}

export const img = series(imgdel, imgcopy, imgminify);

// CONTENT IMAGES

const contentdel = () => {
  return del('build/img/content');
}

const contentcopy = () => {
  return src('src/img/content/*.{png,jpg}')
    .pipe(dest('build/img/content'));
}

const contentconvert = () => {
  return src('build/img/content/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(dest('build/img/content'));
}

export const content = series(contentdel, contentcopy, contentconvert);

// SVG-SPRITE

const svgspritedel = () => {
  return del('build/img/svg-sprite');
}

const svgspritecopy = () => {
  return src('src/img/svg-sprite/*.svg')
    .pipe(dest('build/img/svg-sprite'))
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('build/img/svg-sprite'));
}

export const svgsprite = series(svgspritedel, svgspritecopy);

//GH-PAGES

export const deploy = () => {
  return ghPages.publish('build');
}


// LIVE SERVER

const reload = (cb) => {
  server.reload();
  cb();
}

export const serve = (cb) => {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  watch('src/scss/**/*.{scss,sass}', series(style));
  watch('src/*.html', series(htmldel, htmlcopy, reload));
  watch('src/components/*.html', series(htmldel, htmlcopy, reload));
  watch('src/js/**/*.js', series(jsdel, jsvendor, jsmodules, reload));
  cb();
}

// BUILD

export const build = series(
  clean,
  parallel(
    html,
    style,
    js,
    fonts,
    favicons,
    series(
      series(img, svgsprite),
      content,
    ),
  ),
);
