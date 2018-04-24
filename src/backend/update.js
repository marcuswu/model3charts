var db = require('./util/db');
var update = require('./util/retrieveData');

update.updateDatabase(db).then(function() {
    console.log('done');
    process.exit(0);
}).catch(function (err) {
    console.log('failed: ' + err);
    process.exit(1);
});
