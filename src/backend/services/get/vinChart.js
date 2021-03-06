/*jslint node: true */
'use strict';

var db = require('../../util/db');

var vinChart = {
    paths: ['/vinChartData/'],
    requestHandler: function(req, res, next) {
        var startDate = req.query.start;
        var endDate = req.query.end;
        var country = req.query.country;
        var wheels = req.query.wheels;
        var reservationCollection = db.get('reservation');

        var weekIntervals = function(startDate, endDate) {
          var dates = [],
          currentDate = startDate,
          addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
          };
          while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 14);
          }
          if (dates[dates.length-1] != endDate) {
            dates.push(endDate);
          }
          return dates;
        };
        // Pull all reservations where VIN assignment date is not null and VIN is not null
        var query = { vin: { $ne: null }, vinDate: { $ne: null }};
        if (startDate) {
            query.vinDate.$gte = new Date(startDate);
        }
        if (endDate) {
            query.vinDate.$lte = new Date(endDate);
        }
        if (country) {
            query.country = country;
        }
        if (wheels) {
            query.wheels = wheels == 'aero' ? "18 inch Aero" : "19 inch Sport";
        }
        reservationCollection.find( query ).then(function(reservationData) {
            if (reservationData.length < 1) {
                res.send({ "vinData": [], "trendData": [] });
                return;
            }
          var results = {};
          const options = {year: 'numeric', month: 'short', day: 'numeric' };
          const formatDate = (d) => d.toLocaleDateString('en-US', options);
          results["vinData"] = reservationData.map( x => ({ "x": formatDate(x.vinDate), "y": x.vin }));
          var minDate = new Date(reservationData.reduce( (a, c) => a < c.vinDate ? a : c.vinDate ).valueOf());
          var maxDate = reservationData.reduce( (a, c) => a > c.vinDate ? a : c.vinDate );
          var slopeIntervalBetweenDates = function(dataSet, date1, date2) {
            var data = dataSet.filter(x => x.vinDate.getTime() >= date1.getTime() && x.vinDate.getTime() <= date2.getTime());
            if (data.length < 1) {
              return {"start": date1, "end": date2, "slope": 0, "interval": 0};
            }
            if (data.length <= 2) {
              return {"start": date1, "end": date2, "slope": data[0].vin / data[0].vinDate.getTime(), "interval": 0};
            }
            var xSum = data.reduce((a, c) => a + parseInt(c.vinDate.getTime()), 0);
            var ySum = data.reduce((a, c) => a + parseInt(c.vin), 0);
            var xySum = data.reduce((a, c) => a + parseInt(c.vinDate.getTime()) * parseInt(c.vin), 0);
            var xSqSum = data.reduce((a, c) => a + parseInt(c.vinDate.getTime()) * parseInt(c.vinDate.getTime()), 0);
            var ySqSum = data.reduce((a, c) => a + parseInt(c.vin) * parseInt(c.vin), 0);
            var divisor = ((data.length * xSqSum) - (xSum * xSum));
            var slope = ((data.length * xySum) - (xSum * ySum)) / divisor;
            var interval = ((ySum * xSqSum) - (xSum * xySum)) / divisor;

            return {"start": date1, "end": date2, "slope": slope, "interval": interval};
          };
          let intervals = weekIntervals(minDate, maxDate);
          let slopeIntervalPoints = [];
          for (var i = 1; i < intervals.length; i++) {
            var date1 = intervals[i-1];
            var date2 = i < intervals.length ? intervals[i] : new Date();
            slopeIntervalPoints.push(slopeIntervalBetweenDates(reservationData, date1, date2));
          }
          const first = slopeIntervalPoints[0];
          const firstResult = {"x": new Date(formatDate(first.start)), "y": (first.slope * first.start.getTime()) + first.interval };
          results["trendData"] = slopeIntervalPoints.map( p => ({"x": formatDate(p.end), "y": (p.slope * p.end.getTime()) + p.interval }));
          results["trendData"].unshift(firstResult);
          res.send(results);
        });
    }
};

module.exports = vinChart;
