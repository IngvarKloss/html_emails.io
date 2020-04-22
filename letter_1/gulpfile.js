"use strict";
const { src, dest, series, parallel, watch } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins({
        // DEBUG: true,
        overridePattern: false,
        pattern: ['browser-*','imagemin-*','delete','panini','inky'],
        rename: {'gulp-inline-source': 'inlineSource',
                'imagemin-jpeg-recompress': 'jpegRecompress',
                'imagemin-pngquant': 'pngquant',
                'imagemin-jpegtran': 'jpegtran'}
});


const path = {
  build: {
    html: "output/",
    css: "output/",
    images: "output/"

  },
  src: {
    html: "src/html/pages/*.{htm,html,php}",
    css: "src/scss/**/*.scss",
    images: "src/img/**/*.{jpg,png,svg,gif,ico}"
  },
  watch: {
      html: "src/**/*.{htm,html,php}",
      css: "src/scss/**/*.scss",
      images: "src/img/**/*.{jpg,png,svg,gif,ico}"
  },
  clean: "output/**/*.*",
  cleanExeptImg: "!output/img/**/*"
};



function browserSync(done) {
  plugins.browserSync.init({
        server: {
            baseDir: "./output/"
        },
        port: 3000
    });
    done();
}

function browserSyncReload(done) {
    plugins.browserSync.reload();
    done();
}

 function html() {
  plugins.panini.refresh();
  return src(path.src.html)
  .pipe(plugins.plumber())
  .pipe(plugins.panini({
      root: 'src/html/pages/',
      layouts: 'src/html/layouts/',
      partials: 'src/html/partials/',
      helpers: 'src/html/helpers/',
      data: 'src/html/data/'
    }))
  .pipe(plugins.inky())
  .pipe(dest(path.build.html))
  .pipe(plugins.browserSync.stream());
}

function css() {
  return src(path.src.css)
  .pipe(plugins.plumber())
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sass().on('error', plugins.sass.logError))
  .pipe(plugins.autoprefixer({
    overrideBrowserslist: ['last 8 versions', 'ie >= 9'],
    cascade: false
  }))
  .pipe(plugins.sourcemaps.write())
  .pipe(dest(path.build.css))
  .pipe(plugins.browserSync.stream());
}

function mincss() {
  return src(path.src.css)
  .pipe(plugins.plumber())
  .pipe(plugins.sass().on('error', plugins.sass.logError))
  .pipe(plugins.autoprefixer({
    overrideBrowserslist: ['last 8 versions', 'ie >= 9'],
    cascade: false
  }))
  .pipe(plugins.cleanCss({
    compatibility: 'ie9',
    properties: {
      colors: false
    }
  }))
  .pipe(dest(path.build.css))
}

function release() {
  return src(path.build.html+'*.{htm,html,php}')
  .pipe(plugins.plumber())
  .pipe(plugins.inlineSource())
  .pipe(plugins.inlineCss({
    preserveMediaQueries: true,
    removeLinkTags: false
  }))
  .pipe(plugins.htmlmin({
    collapseWhitespace: true,
    minifyCSS: true
  }))
  .pipe(plugins.rename({
      suffix: ".min",
  }))
  .pipe(dest(path.build.html));
}

function images() {
  return src(path.src.images, { base: 'src' })
    .pipe(plugins.imagemin(
      [
    plugins.imagemin.gifsicle({interlaced: true}),
    // plugins.imagemin.mozjpeg({quality: 75, progressive: true}),
    plugins.jpegtran({progressive: true}),
    plugins.jpegRecompress({
      loops: 6,
      min: 65,
      max: 70,
      quality:'medium'
    }),
    plugins.imagemin.optipng({optimizationLevel: 3}),
    plugins.pngquant({quality: [0.65, 0.75], speed: 5}),
    plugins.imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
      ]
    ))
    .pipe(dest(path.build.images));
}

function clean(cb) {
  plugins.delete([path.clean, path.cleanExeptImg], cb(console.log(' Files in \'output\' have been deleted')));
}

function watchFiles() {
    watch([path.watch.html], html);
    // watch([path.watch.images], images);
    watch([path.watch.css], css);
}


const build = series(clean, parallel(html, css));

const defaultTask = parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.release = series(clean, parallel(html, mincss), release);
exports.default = defaultTask;
