var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var buildVars = require('../buildVars');

gulp.task('compileStyles', function() {
    return gulp.src('src/frontend/less/**/*.less')
        .pipe(less({ paths: [ path.join(__dirname, 'src', 'frontend', 'less', 'includes') ] }))
        .pipe(gulp.dest(path.join(buildVars.dest, 'static', 'css')));
});
