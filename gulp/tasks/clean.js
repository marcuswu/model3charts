'use strict';

var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var buildVars = require('../buildVars');

gulp.task('clean', function() {
    return gulp.src(buildVars.dest, { read: false }).pipe(rimraf());
});
