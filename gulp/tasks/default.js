'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('default', function(done) {
    runSequence('clean', 'build', /*'serve',*/ done);
});
