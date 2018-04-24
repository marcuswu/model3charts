'use strict';

var fs = require('fs');
var path = require('path');
var onlyJsFiles = function(filename) {
    // anything ending in .js should be javascript
    return /(\.(js)$)/i.test(path.extname(filename));
};
var taskFiles = fs.readdirSync('./gulp/tasks/').filter(onlyJsFiles);

taskFiles.forEach(function(taskFile) {
    console.log('loading task: ' + taskFile);
    require('./tasks/' + taskFile);
});
