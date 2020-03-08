"use strict";
// my_gulp
const { src, dest, series, parallel, watch } = require('gulp');
const del = require('delete');
const panini = require('panini');
const inky = require('inky');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const inlineCss = require('gulp-inline-css');
const inlinesource = require('gulp-inline-source');
const rename = require('gulp-rename');
const browsersync = require('browser-sync').create();
const htmlmin = require('gulp-htmlmin');
// const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');


const path = {
  build: {
    html: "output/",
    css: "output/",
    images: "output/"
    // images: "output/img"
  },
  src: {
    html: "src/html/pages/*.{htm,html,php}",
    css: "src/scss/foundation-emails.scss",
    images: "src/img/**/*.{jpg,png,svg,gif,ico}"
  },
  watch: {
      html: "src/**/*.{htm,html,php}",
      css: "src/sass/**/*.scss",
      images: "src/img/**/*.{jpg,png,svg,gif,ico}"
  },
  clean: "output/**/*.*",
  cleanExeptImg: "!output/img/*"
};



function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./output/"
        },
        port: 3000
    });
    done();
}

function browserSyncReload(done) {
    browsersync.reload();
    done();
}

 function html() {
panini.refresh();
  return src(path.src.html)
  .pipe(plumber())
  .pipe(panini({
      root: 'src/html/pages/',
      layouts: 'src/html/layouts/',
      partials: 'src/html/partials/',
      helpers: 'src/helpers/',
      data: 'src/html/data/'
    }))
  .pipe(inky())
  .pipe(dest(path.build.html))
  .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
  .pipe(plumber())
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 8 versions'],
    cascade: false
  }))
  .pipe(sourcemaps.write())
  .pipe(dest(path.build.css))
  .pipe(browsersync.stream());
}

function release() {
  return src(path.build.html+'*.{htm,html,php}')
  .pipe(plumber())
  .pipe(inlinesource())
  .pipe(inlineCss({
    preserveMediaQueries: true,
    removeLinkTags: false
  }))
  .pipe(htmlmin({
    collapseWhitespace: true,
    minifyCSS: true
  }))
  .pipe(rename({
      suffix: ".min",
  }))
  .pipe(dest(path.build.html));
}

function images() {
  return src(path.src.images, { base: 'src' })
    // .pipe(imagemin(
    //   [
    // imagemin.gifsicle({interlaced: true}),
    // imagemin.mozjpeg({quality: 75, progressive: true}),
    // imagemin.optipng({optimizationLevel: 5}),
    // imagemin.svgo({
    //         plugins: [
    //             {removeViewBox: true},
    //             {cleanupIDs: false}
    //         ]
    //     })
    //   ]
    // ))
    .pipe(dest(path.build.images));
}

function clean(cb) {
  del([path.clean, path.cleanExeptImg], cb( console.log(' Files in \'output\' have been deleted')));
}

function watchFiles() {
    watch([path.watch.html], html);
    // watch([path.watch.images], images);
    watch([path.watch.css], css);
}


const build = series(clean, parallel(html, css));

const defaultTask = parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = series(clean, css);
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.release = series(build, release);
exports.default = defaultTask;
