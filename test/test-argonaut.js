'use strict';

var fs = require('fs');
var path = require('path');
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
        this.timeout(500000);
        drefc.search(serverInfo, 'Patient', function (err, body) {
            if (err) {
                done(err);
            } else {
                expect(body.entry).to.have.length.above(0);
                var p = path.join(__dirname, '..', 'generated', 'patients_bundle.json');
                fs.writeFileSync(p, JSON.stringify(body, undefined, 4));
                done();
            }
        });
    });
});
