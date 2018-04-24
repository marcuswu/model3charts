'use strict';

var gulp = require('gulp');
var path = require('path');
var buildVars = require('../buildVars');
var merge = require('merge-stream');

gulp.task('copyStaticContent', function() {
    var copyImages = gulp.src('src/frontend/images/**/*.{jpg,png,gif,svg}')
        .pipe(gulp.dest(path.join(buildVars.dest, 'static', 'images')));
    var copyBower = gulp.src('src/frontend/bower_components/**/*')
        .pipe(gulp.dest(path.join(buildVars.dest, 'static', 'bower_components')));
    var copyElements = gulp.src('src/frontend/elements/**/*')
        .pipe(gulp.dest(path.join(buildVars.dest, 'static', 'elements')));
    var copyIndex = gulp.src('src/frontend/*.{html,js}')
        .pipe(gulp.dest(path.join(buildVars.dest, 'static')));

    return merge(copyImages, copyBower, copyElements, copyIndex);
});
