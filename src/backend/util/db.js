/*jslint node: true */
'use strict';

var db = require('monk')('localhost/model3data');

module.exports = db;
