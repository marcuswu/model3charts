/*jslint node: true */
'use strict';

var db = require('../../util/db');

var vinWaiterData = {
    paths: ['/vinWaiterData'],
    requestHandler: function(req, res, next) {
        var startDate = req.query.start;
        var endDate = req.query.end;
        var wheels = req.query.wheels;
        var country = req.query.country;
        var reservationCollection = db.get('reservation');

        const convertColor = function(color) {
            switch (color) {
                case "Deep Blue Metallic":
                return "blue";
                case "Midnight Silver Metallic":
                return "darkSilver";
                case "Pearl White Multi-Coat":
                return "white";
                case "Red Multi-Coat":
                return "red";
                case "Silver Metallic":
                return "silver";
                case "Solid Black":
                return "black";
                default:
                return null;
            }
        }

        var colorStats = function(reservations) {
            const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            var daysPassed = d => Math.round(Math.abs((new Date().getTime() - d.getTime()) / oneDay));
            var totalDays = 0;
            var minDays = -1;
            var maxDays = -1;
            reservations.forEach(function(reservation) {
                var days = daysPassed(reservation.configurationDate);
                totalDays += days;
                minDays = (minDays < 0 || days < minDays) ? days : minDays;
                maxDays = (maxDays < 0 || days > maxDays) ? days : maxDays;
            });
            return { "min": minDays, "avg": totalDays / reservations.length, "max": maxDays };
        };
        var findQuery = {configurationDate: {$ne: null }, vinDate: {$eq: null }, deliveryDate: {$eq: null}};
        if (wheels) {
            findQuery.wheels = wheels == 'aero' ? '18 inch Aero' : '19 inch Sport';
        }
        if (country) {
            findQuery.country = country;
        }
        if (startDate) {
            findQuery.configurationDate.$gte = new Date(startDate);
        }
        if (endDate) {
            findQuery.configurationDate.$lte = new Date(endDate);
        }
        reservationCollection.find(findQuery).then(function(reservations) {
            // Count waiting days, total reservations for each color
            var blue = reservations.filter( x => convertColor(x.color) == 'blue' );
            var darkSilver = reservations.filter( x => convertColor(x.color) == 'darkSilver' );
            var white = reservations.filter( x => convertColor(x.color) == 'white' );
            var red = reservations.filter( x => convertColor(x.color) == 'red' );
            var silver = reservations.filter( x => convertColor(x.color) == 'silver' );
            var black = reservations.filter( x => convertColor(x.color) == 'black' );
            var grouped = {};
            grouped.blue = colorStats(blue);
            grouped.darkSilver = colorStats(darkSilver);
            grouped.white = colorStats(white);
            grouped.red = colorStats(red);
            grouped.silver = colorStats(silver);
            grouped.black = colorStats(black);
            res.send(grouped);
        });
    }
};

module.exports = vinWaiterData;
