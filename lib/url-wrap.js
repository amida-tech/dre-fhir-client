'use strict';

var path = require('path');
var url = require('url');
var _ =  require('lodash');

exports.search = function(serverInfo, resourceType, parameters) {
	parameters = parameters || {};
	var query = _.extend({
        _format: 'application/json+fhir'
    }, parameters);
    var urlObj = {
        protocol: 'http',
        hostname: serverInfo.hostname,
        port: serverInfo.port,
        pathname: path.join(serverInfo.pathname, resourceType),
        query: query
    };
    var urlstring = url.format(urlObj);
    console.log(urlstring);
    return urlstring;
};
