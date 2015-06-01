'use strict';

var servers = require('../servers');
var client = require('../../lib/client');
var url = require('../../lib/url-wrap');

var serverInfo = servers.argonautOpen;
var urlstring = url.search(serverInfo, 'Patient/$everything');

client.search(urlstring, function (err, bundle) {
    if (err) {
        console.log(err);
    } else {
        console.log(bundle);
        //bundle.entry.forEach(function(entry) {
        //	var id = entry.resource.id;
        //	var curlstring = url.search(serverInfo, 'Condition', {
        //		patient: id
        //	});
        //	console.log(curlstring);
        //	client.search(curlstring, function(err, conditions) {
        //		if (err) {
        //			console.log(err);
        //		} else {
        //			console.log(conditions);
        //		}
        //	});
        //});
    }
});
