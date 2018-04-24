var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
//var process = require('process');

var createDatabase = function(db) {
  var createCollection = function(db) {
    return db.createCollection('reservation');
  };
  var createIndexes = function (coll) {
    return Promise.all([
      coll.createIndex({ username: 1 }, { unique: false }),
      coll.createIndex({ state: 1 }, { unique: false }),
      coll.createIndex({ date: 1 }, { unique: false }),
      coll.createIndex({ inviteDate: 1 }, { unique: false }),
      coll.createIndex({ vin: 1 }, { unique: false }),
      coll.createIndex({ vinDate: 1 }, { unique: false }),
      coll.createIndex({ deliveryDate: 1 }, { unique: false }),
      coll.createIndex({ color: 1 }, { unique: false }),
      coll.createIndex({ wheels: 1 }, { unique: false })
    ]);
  };

  return createCollection(db)
  .then( () => createIndexes(db.collection('reservation')), (err) => console.log('index error: ' + err));
};

// Connect to the db
MongoClient.connect("mongodb://localhost:27017", function(err, client) {
  if(err) {
    console.log('Error connecting to database: ' + err);
    return;
  }

  const db = client.db("model3data");
  createDatabase(db).then( () => db.logout().then(() => db.close()));
});
