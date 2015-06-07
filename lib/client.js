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

var searchRequestOptions = function (serverInfo, urlstring) {
    var options = {
        method: 'GET',
        uri: urlstring,
    };
    if (serverInfo.rejectUnauthorized !== undefined) {
        options.rejectUnauthorized = serverInfo.rejectUnauthorized;
    }
    if (serverInfo.access_token !== undefined) {
        options.auth = {
            bearer: serverInfo.access_token
        };
    }
    return options;
};

var _searchAll = function _searchAll(options, currentCount, maxCount, callback) {
    request.get(options, function (err, response, bundle) {
        if (err) {
            callback(err);
        } else if (response.statusCode > 399) {
            callback(new Error('Invalid status: ' + response.statusCode), bundle);
        } else {
            var next = _.find(bundle.link, function (link) {
                return link.relation === 'next';
            });
            currentCount += bundle.entry.length;
            if (next && ((!maxCount) || (currentCount < maxCount))) {
                console.log(next.url);
                var nextOptions = _.cloneDeep(options);
                nextOptions.uri = next.url;
                _searchAll(nextOptions, currentCount, maxCount, function (err, remaining) {
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

exports.searchAll = function searchAll(serverInfo, resourceType, parameters, maxCount, callback) {
    if (!callback) {
        callback = maxCount;
        maxCount = null;
    }
    var urlstring = urlwrap.search(serverInfo, resourceType, parameters);
    var options = searchRequestOptions(serverInfo, urlstring);
    _searchAll(options, 0, maxCount, callback);
};

exports.search = function (serverInfo, resourceType, parameters, callback) {
    var urlstring = urlwrap.search(serverInfo, resourceType, parameters);
    var options = searchRequestOptions(serverInfo, urlstring);
    request(options, function (err, response, bundle) {
        if (err) {
            callback(err);
        } else {
            callback(null, bundle);
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
            var msg = 'Invalid post statsu: ' + response.statusCode;
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

exports.update = function (serverInfo, resourceType, id, resource, callback) {
    var urlstring = urlwrap.update(serverInfo, resourceType, id);
    var postObject = {
        url: urlstring,
        json: resource
    };
    request.put(postObject, function (err, response, body) {
        if (err) {
            callback(err);
        } else if (response.statusCode !== 200) {
            var msg = 'Invalid update statsu: ' + response.statusCode;
            callback(new Error(msg));
        } else {
            callback(null);
        }
    });
};

exports.read = function (serverInfo, resourceType, id, callback) {
    var urlstring = urlwrap.read(serverInfo, resourceType, id);
    request.get(urlstring, function (err, response, resource) {
        if (err) {
            callback(err);
        } else if (response.statusCode !== 200) {
            var msg = 'Invalid read status: ' + response.statusCode;
            callback(new Error(msg));
        } else {
            callback(null, resource);
        }
    });
};

exports.delete = function (serverInfo, resourceType, id, callback) {
    var urlstring = urlwrap.delete(serverInfo, resourceType, id);
    request.del(urlstring, function (err, response) {
        if (err) {
            callback(err);
        } else if (response.statusCode !== 200) {
            var msg = 'Invalid delete status: ' + response.statusCode;
            callback(new Error(msg));
        } else {
            callback(null);
        }
    });
};
