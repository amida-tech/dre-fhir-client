'use strict';

var fs = require('fs');
var path = require('path');
var chai = require('chai');

var fc = require('../index');

var expect = chai.expect;

describe('localhost:1337/fhir', function () {
    var client;

    xit('get all patients that are born in 1965', function (done) {
        this.timeout(20000);

        client.search({
            type: 'Patient',
            query: {
                'birthDate': '1965'
            }
        }, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                expect(bundle).to.exist;
                console.log(bundle);
                bundle.entry.forEach(function (bundleEntry) {
                    var resource = bundleEntry.resource;
                    var dob = resource.birthDate;
                    expect(dob.substring(0, 4)).to.equal('1965');
                });
                done();
            }
        });
    });

    it('get all patients, one page', function (done) {
        this.timeout(5000);

        client.search({
            type: 'Observation',
            query: {}
        }, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                expect(bundle.entry).to.have.length.above(0);
                done();
            }
        });
    });
});
