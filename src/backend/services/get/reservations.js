var db = require('../../util/db');
var reservationData = require('../../util/retrieveData');

var reservations = {
    paths: ['/reservations/'],
    requestHandler: function(req, res, next) {
        reservationData.updateDatabase(db)
        .then(() => db.get('reservation').find({}))
        .then(r => res.send(r))
        .catch(function(err) {
          res.status(500).send(err);
        });
    }
};

module.exports = reservations;
