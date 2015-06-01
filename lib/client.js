'use strict';

var url = require('url');
var path = require('path');
var util = require('util');

var request = require('request');
var _ = require('lodash');

var urlwrap = require('./url-wrap');

request = request.defaults({
    json: true
});

exports.searchAll = function getAll(urlstring, callback) {
    request.get(urlstring, function (err, response, bundle) {
        if (err) {
            callback(err);
        } else {
            var next = _.find(bundle.link, function (link) {
                return link.relation === 'next';
            });
            if (next) {
                console.log(next);
                getAll(next.url, function (err, remaining) {
                    if (err) {
                        callback(err);
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
    var urlstring = urlwrap.search(serverInfo, resourceType, parameters);
    request.get(urlstring, function (err, response, body) {
        if (err) {
            callback(err);
        } else {
            callback(null, body);
        }
    });
};

exports.create = function (serverInfo, resourceType, resource, callback) {
    var urlstring = urlwrap.create(serverInfo, resourceType);
    var postObject = {
        url: urlstring,
        json: resource
    };
    request.post(postObject, function (err, response, body) {
        if (err) {
            callback(err);
        } else if (response.statusCode !== 201) {
            var msg = 'Invalid post response: ' + response.statusCode;
            callback(new Error(msg));
        } else {
            var location = _.get(response, 'headers.location');
            if (!location) {
                var errMsg = util.format('No location is found in the header.');
                callback(new Error(errMsg));
            } else {
                var locationPieces = location.split('/');
                var index = locationPieces.indexOf(resourceType) + 1;
                if (index > 0) {
                    callback(null, locationPieces[index]);
                } else {
                    var locationErrMsg = util.format('Unexpected location: %s', location);
                    callback(new Error(locationErrMsg));
                }
            }
        }
    });
};
