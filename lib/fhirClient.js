'use strict';

var request = require('request');
var url = require('url');
var path = require('path');
var _ = require('lodash');

request = request.defaults({
    json: true
});

var getAll = function getAll(urlstring, callback) {
    request.get(urlstring, function (err, response, bundle) {
        if (err) {
            callback(err);
        } else {
            var next = _.find(bundle.link, function(link) {
                return link.relation === 'next';
            });
            if (next) {
                console.log(next);
                getAll(next.url, function(err, remaining) {
                    if (err) {
                        callback(err)
                    } else {
                        bundle.entry = bundle.entry.concat(remaining.entry);
                        callback(null, bundle);
                    }
                });
            } else {
                callback(null, bundle);
            }
        }
    });
};

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

    getAll(urlstring, callback);

    //request.get(urlstring, function (err, response, body) {
    //    if (err) {
    //        callback(err);
    //     } else {
    //        callback(null, body);
    //    }
    //});
};
