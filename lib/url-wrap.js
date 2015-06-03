'use strict';

var path = require('path');
var url = require('url');

var _ = require('lodash');

var toUrlString = function (serverInfo, addlPath, parameters) {
    var urlObj = _.cloneDeep(serverInfo);

    var pathname = path.join(urlObj.pathname, addlPath);
    urlObj.pathname = pathname;

    parameters = parameters || {};
    var query = _.extend({
        _format: 'application/json+fhir'
    }, parameters);
    urlObj.query = query;

    var result = url.format(urlObj);
    return result;
};

exports.search = function (serverInfo, resourceType, parameters) {
    var urlstring = toUrlString(serverInfo, resourceType, parameters);
    return urlstring;
};

exports.create = function (serverInfo, resourceType) {
    var urlstring = toUrlString(serverInfo, resourceType);
    return urlstring;
};

exports.read = function (serverInfo, resourceType, id) {
    var addlPath = path.join(resourceType, id);
    var urlstring = toUrlString(serverInfo, addlPath);
    return urlstring;
};

exports.delete = function (serverInfo, resourceType, id) {
    var addlPath = path.join(resourceType, id);
    var urlstring = toUrlString(serverInfo, addlPath);
    return urlstring;
};

exports.update = function (serverInfo, resourceType, id) {
    var addlPath = path.join(resourceType, id);
    var urlstring = toUrlString(serverInfo, addlPath);
    return urlstring;
};
