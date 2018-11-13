var gulp = require('gulp');

/* Default */
var fs = require('fs');

/* Mixed */
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');

/* CSS */
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');

/* JS */
var uglify = require('gulp-uglify');

gulp.task('build-scss', function () {
  return gulp.src('./src/scss/*.scss')
  .pipe(sass())
  .pipe(autoprefixer({
    browsers: ['last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
    cascade: false
  }))
  .pipe(concat('bundle.css'))
  .pipe(minify())
  .pipe(gulp.dest('./'));
});

gulp.task('build-js', function () {
  return browserify('./src/js/main.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./'));
});


gulp.task('default', function () {

  gulp.start('build-js');
  gulp.start('build-scss');

  watch('./src/js/**/*.js', function () {
    gulp.start('build-js');
  });

  watch('./src/scss/*.scss', function () {
    gulp.start('build-scss');
  });

});
