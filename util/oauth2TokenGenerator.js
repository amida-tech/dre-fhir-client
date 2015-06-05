'use strict';

var express = require('express');
var request = require('request');
var simpleOauth2 = require('simple-oauth2');
var _ = require('lodash');

var generateState = (function() {
	var possible = 'abcdefghijklmnopqrstuvwxyz';
	var n = 8;

	return function() {
		return _.range(n).reduce(function(r) {
			var randomIndex = Math.floor(Math.random() * possible.length);
			r += possible.charAt(randomIndex);
			return r;
		}, "");
	};
})();

var generateTokenOptions = function(req, options) {
	var authorization = new Buffer(options.clientID + ':' + options.clientSecret).toString('base64');
	var r = {
		uri: options.site + options.tokenPath,
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + authorization,
		},
		rejectUnauthorized: options.rejectUnauthorized,
		form: {
			code: req.query.code,
			state: req.query.state,
			redirect_uri: options.redirect_uri,
        	grant_type: "authorization_code",
        	client_id: options.clientID,
       		client_secret: options.clientSecret
		}
	};
	return r;
};

exports.generateApp = function(options) {
	var app = express();

	var credentials = {
		clientID: options.clientID,
		clientSecret: options.clientSecret,
		site: options.site,
		authorizationPath: options.authorizationPath,
		tokenPath: options.tokenPath,
  		rejectUnauthorized: options.rejectUnauthorized
	};

	var oauth2 = simpleOauth2(credentials);

	var state = generateState();

	var uriInfo = {
		redirect_uri: options.redirect_uri,
		scope: options.scope,
		state: state,
		aud: options.aud
	};

	// callback
	app.get('/dfccb', function(req, res) {
		var tokenOptions = generateTokenOptions(req, options);
		request(tokenOptions, function(err, result) {
			if (err) {
				console.log('Access Token Error: ' + err.message);
			} else {
				console.log('=========');
				console.log(result);
				console.log('==========');
			}
			res.send('done');
		});
	});

	var authorizationUri = oauth2.authCode.authorizeURL(uriInfo);
	app.get('/auth', function(req, res) {
		res.redirect(authorizationUri);
	});

	app.get('/login', function(req, res) {
		res.send('Hello<br><a href="/auth">Log in to server</a>');
	});

	return app;
};
