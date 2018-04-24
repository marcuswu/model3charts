'use strict';

var gulp = require('gulp');
var path = require('path');
var buildVars = require('../buildVars');

gulp.task('deployServer', function(done) {
    return gulp.src('src/backend/**/*')
        .pipe(gulp.dest(buildVars.dest));
});
