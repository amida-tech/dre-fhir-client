'use strict';

var _ = require('lodash');

var bundlefile = process.argv[2];
var fieldpath = process.argv[3];

if (! bundlefile) {
	console.log(bundlefile + ' does not exist.');
} else if (! fieldpath) {
	console.log(fieldpath + ' does not exist.');
} else {
	var bundle = require(bundlefile);
	var length = bundle.entry.length;
	var count = bundle.entry.reduce(function(r, entry, index) {
		var resource = entry.resource;
		if (resource) {
			var field = _.get(resource, fieldpath);
			if (field) {
				++r;
			}
		}
		return r;
	}, 0);
	console.log(count + ' out of ' + length + ' contains ' + fieldpath + '.');
}
