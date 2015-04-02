'use strict';

var chai = require('chai');

var drefc = require('../index');

var expect = chai.expect;

describe('http://argonaut.healthintersections.com.au/', function () {
    var serverInfo = {
        hostname: 'argonaut.healthintersections.com.au',
        port: 80,
        pathname: 'open'
    };

    it('get all patients', function (done) {
        this.timeout(5000);
        drefc.search(serverInfo, 'Patient', function (err, body) {
            if (err) {
                done(err);
            } else {
                expect(body.entry).to.have.length.above(0);
                done();
            }
        });
    });
});
