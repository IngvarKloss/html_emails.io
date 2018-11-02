var gulp = require('gulp'),
  sass = require('gulp-sass'),
  inky = require('inky'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create(),
  gulpIf = require('gulp-if'),
  inlineCss = require('gulp-inline-css'),
  inlinesource = require('gulp-inline-source'),
  panini = require('panini');

var config = {
  paths: {
    scss: './scss/**/*.scss',
    html: './src/pages/**/*.html'
  },
  output: {
    path: './output'
  },
  isDevelop: false
};


gulp.task('styles', function () {
  return gulp.src(config.paths.scss)
    .pipe(gulpIf(config.isDevelop, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpIf(config.isDevelop, sourcemaps.write(), gulp.dest('./src')))
    .pipe(gulp.dest(config.output.path))
    .pipe(browserSync.stream());
});

gulp.task('panini', function () {
  return gulp.src(config.paths.html)
  .pipe(panini({
      root: './src/pages/',
      layouts: './src/layouts/',
      partials: './src/partials/',
      helpers: './src/helpers/',
      data: './src/data/'
    }))
  .pipe(gulp.dest('./src'))
})

gulp.task('inky', ['panini', 'styles'],  function () {
  return gulp.src('./src/*.html')
    .pipe(gulpIf(!config.isDevelop, inlinesource()))
    .pipe(inky())
    .pipe(gulpIf(!config.isDevelop,  inlineCss({
      preserveMediaQueries: true,
      removeLinkTags: false
    })))
    .pipe(gulp.dest(config.output.path))
    .pipe(browserSync.stream());
});


gulp.task('inky:reset', function () {
  panini.refresh();

});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: config.output.path
    }
  });
  gulp.watch(config.paths.scss, ['styles']);

  gulp.watch(config.paths.html, ['inky']);

 gulp.watch(['src/{layouts,partials,helpers,data}/**/*'], ['inky:reset','inky']);
});

gulp.task('default', ['inky', 'serve']);
