 'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', function(done) {
    runSequence(['compileStyles', 'compileScripts', 'copyStaticContent'],
        'deployServer',
        done);
});
