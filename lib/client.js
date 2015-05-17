'use strict';

var request = require('request');
var url = require('url');
var path = require('path');
var _ = require('lodash');

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

exports.search = function (urlstring, callback) {
    request.get(urlstring, function (err, response, body) {
        if (err) {
            callback(err);
         } else {
            callback(null, body);
        }
    });
};
