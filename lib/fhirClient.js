'use strict';

var request = require('request');
var url = require('url');
var path = require('path');

request = request.defaults({
    json: true
});

exports.search = function (serverInfo, resourceType, parameters, callback) {
    var urlObj = {
        protocol: 'http',
        hostname: serverInfo.hostname,
        port: serverInfo.port,
        pathname: path.join(serverInfo.pathname, resourceType),
        query: {
            _format: 'application/json+fhir'
        }
    };
    var urlstring = url.format(urlObj);

    if (!callback) {
        callback = parameters;
    }

    if (typeof callback !== 'function') {
        throw new Error('Invalid callback function.');
    }

    request.get(urlstring, function (err, response, body) {
        if (err) {
            callback(err);
        } else {
            callback(null, body);
        }
    });
};
