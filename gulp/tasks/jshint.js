'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');

// JSHint
gulp.task('jshint', function () {
  return gulp.src(['src/backend/services/**/*.js', 'src/backend/utils/**/*.js', 'src/backend/index.js' /** add frontend files! */])
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
});
