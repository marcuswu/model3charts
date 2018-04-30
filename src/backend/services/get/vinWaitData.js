/*jslint node: true */
'use strict';

var db = require('../../util/db');

var vinWaitData = {
    paths: ['/vinWaitData'],
    requestHandler: function(req, res, next) {
        var startDate = req.query.start;
        var endDate = req.query.end;
        var country = req.query.country;
        var wheels = req.query.wheels;
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
        const getColor = function(count, total) {
            if (total == 0) {
                return 'rgb(255, 255, 255);';
            }
            const percent = count / total;
            const minColor = [255, 0, 0];
            const maxColor = [0, 255, 0];
            const colorParts = [0, 1, 2].map( (i) => Math.round(((maxColor[i] - minColor[i]) * percent) + minColor[i] ));
            return 'rgb(' + colorParts.join(', ') + ');';
        };

        const groupReservations = function(reservations) {
            var grouped = {
                "blue": { "vins": 0, "total": 0, "color": "#fff;" },
                "darkSilver": { "vins": 0, "total": 0, "color": "#fff;" },
                "white": { "vins": 0, "total": 0, "color": "#fff;" },
                "red": { "vins": 0, "total": 0, "color": "#fff;" },
                "silver": { "vins": 0, "total": 0, "color": "#fff;" },
                "black": { "vins": 0, "total": 0, "color": "#fff;" }
            };
            // count reservations with and without vin for each color / wheel type
            reservations.forEach(function(reservation) {
                if (!reservation['color'] || !reservation['wheels']) {
                    return;
                }
                const color = convertColor(reservation['color']);
                if (reservation['vin'] || reservation['vinDate'] || reservation['deliveryDate']) {
                    grouped[color].vins += 1;
                }
                grouped[color].total += 1;
            });
            Object.keys(grouped).forEach(c => grouped[c].color = getColor(grouped[c].vins, grouped[c].total));
            return grouped;
        }
        // Retrieve list of unique configuration dates
        // Find reservations with each configuration date -- count those with and without vins
        var findQuery = {configurationDate: {$ne: null }};
        if (startDate) {
            findQuery.configurationDate.$gte = new Date(startDate);
        }
        if (endDate) {
            findQuery.configurationDate.$lte = new Date(endDate);
        }
        reservationCollection.distinct('configurationDate', findQuery).then( function(dates) {
            var dateJobs = [];
            var totals = {
                "blue": { "vins": 0, "total": 0, "color": "#fff;" },
                "darkSilver": { "vins": 0, "total": 0, "color": "#fff;" },
                "white": { "vins": 0, "total": 0, "color": "#fff;" },
                "red": { "vins": 0, "total": 0, "color": "#fff;" },
                "silver": { "vins": 0, "total": 0, "color": "#fff;" },
                "black": { "vins": 0, "total": 0, "color": "#fff;" },
                "date": "Total"
            };
            var addToTotals = function(group) {
                var doColorTotal = function(total, color) {
                    total.vins += color.vins;
                    total.total += color.total;
                    total.color = getColor(total.vins, total.total);
                }
                doColorTotal(totals.blue, group.blue);
                doColorTotal(totals.darkSilver, group.darkSilver);
                doColorTotal(totals.white, group.white);
                doColorTotal(totals.red, group.red);
                doColorTotal(totals.silver, group.silver);
                doColorTotal(totals.black, group.black);
            };
            dates.forEach(function(date) {
                var findQuery = { configurationDate: date };
                if (country) {
                    findQuery.country = country;
                }
                if (wheels) {
                    findQuery.wheels = wheels == 'aero' ? "18 inch Aero" : "19 inch Sport";
                }
                dateJobs.push(reservationCollection.find(findQuery).then(function(reservations) {
                    var grouped = groupReservations(reservations);
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

module.exports = vinWaitData;
