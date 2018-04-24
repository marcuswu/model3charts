/*jslint node: true */
'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');

var startUp = function() {
    var app = express();
    var server = http.createServer(app);

    // Parse application/json request bodies
    app.use(bodyParser.json());

    // Set up static content
    app.use(express.static(__dirname + '/static'));

    // Find and load all service routes
    ['get', 'post', 'put', 'patch', 'delete'].forEach(function(method) {
        var servicePath = path.join('services', method);
        if (fs.existsSync(servicePath) && fs.lstatSync(servicePath).isDirectory()) {
            fs.readdirSync(servicePath).forEach(function(file) {
                var serviceFile = path.join('.', servicePath, file);
                console.log('loading service at path: ' + serviceFile);
                var serviceData = require('./'+serviceFile);
                app[method](serviceData.paths, serviceData.requestHandler);
            });
        }
    });

    const port = process.env.PORT ? process.env.PORT : 3000;
    const env = process.env.NODE_ENV;
    if (env != "production") {
        server.listen(port);
    }
    server.listen(port, '127.0.0.1');
};

startUp();
