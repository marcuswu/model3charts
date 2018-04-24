'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var path = require('path');
var buildVars = require('../buildVars');

gulp.task('compileScripts', function() {
    return gulp.src('frontend/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(path.join(buildVars.dest, 'static', 'js')));
});
