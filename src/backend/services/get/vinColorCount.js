/*jslint node: true */
'use strict';

var db = require('../../util/db');

var vinColorCount = {
    paths: ['/vinColorCount'],
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

        const groupReservations = function(date, reservations) {
            var grouped = {
                "blue": 0,
                "darkSilver": 0,
                "white": 0,
                "red": 0,
                "silver": 0,
                "black": 0,
                "date": date
            };
            // count reservations with and without vin for each color / wheel type
            reservations.forEach(function(reservation) {
                if (!reservation['color']) {
                    return;
                }
                grouped[convertColor(reservation['color'])] += 1;
            });
            return grouped;
        }
        // Retrieve list of unique vin assignment dates
        // Find reservations with each assignment date
        var findQuery = {vinDate: {$ne: null }};
        if (startDate) {
            findQuery.vinDate.$gte = new Date(startDate);
        }
        if (endDate) {
            findQuery.vinDate.$lte = new Date(endDate);
        }
        reservationCollection.distinct('vinDate', findQuery).then( function(dates) {
            var dateJobs = [];
            var totals = {
                "blue": 0,
                "darkSilver": 0,
                "white": 0,
                "red": 0,
                "silver": 0,
                "black": 0,
            };
            var addToTotals = function(group) {
                totals.blue += group.blue;
                totals.darkSilver += group.darkSilver;
                totals.white += group.white;
                totals.red += group.red;
                totals.silver += group.silver;
                totals.black += group.black;
                totals.date = "Total";
            };
            dates.forEach(function(date) {
                var findQuery = { vinDate: date };
                if (wheels) {
                    findQuery.wheels = wheels == 'aero' ? '18 inch Aero' : '19 inch Sport';
                }
                if (country) {
                    findQuery.country = country;
                }
                dateJobs.push(reservationCollection.find(findQuery).then(function(reservations) {
                    var grouped = groupReservations(date, reservations);
                    const options = {year: 'numeric', month: 'short', day: 'numeric' };
                    grouped.date = date.toLocaleDateString('en-US', options);
                    addToTotals(grouped);
                    return grouped;
                }));
            });
            Promise.all(dateJobs).then(function(results) {
                results.sort((ga, gb) => new Date(gb.date) - new Date(ga.date));
                results.unshift(totals);
                res.send(results);
            });
        });
    }
};

module.exports = vinColorCount;
