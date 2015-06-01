'use strict';

var util = require('util');

var _ = require('lodash');
var chai = require('chai');
var dirtyChai = require('dirty-chai');

var fc = require('../index');
var bbr = require('../node_modules/dre-fhir-server/node_modules/blue-button-record');

chai.use(dirtyChai);
var expect = chai.expect;

var server = {
    protocol: 'http',
    hostname: 'localhost',
    port: '3001',
    pathname: 'fhir'
};

var patientSamples = require('../node_modules/dre-fhir-server/test/samples/patient-samples')();

describe('dre-fhir-server', function () {
    before('clear database', function (done) {
        var options = {
            dbName: 'dre',
            fhir: true,
        };
        bbr.connectDatabase('localhost', options, function (err) {
            if (err) {
                done(err);
            } else {
                bbr.clearDatabase(done);
            }
        });
    });

    var patients = {};

    patientSamples.forEach(function (patientSample, index) {
        var title = util.format('create patient #%s', index);
        it(title, function (done) {
            fc.create(server, 'Patient', patientSample, function (err, id) {
                if (err) {
                    done(err);
                } else {
                    patients[id] = patientSample;
                    done();
                }
            });
        });
    });

    it('search all patients', function (done) {
        fc.search(server, 'Patient', {}, function (err, bundle) {
            if (err) {
                done(err);
            } else {
                try {
                    expect(bundle).to.exist();
                    var entries = bundle.entry;
                    expect(entries).to.exist();
                    expect(entries.length).to.equal(patientSamples.length);
                    var actuals = entries.reduce(function (r, entry) {
                        var resource = _.cloneDeep(entry.resource);
                        r[resource.id] = resource;
                        delete resource.id;
                        return r;
                    }, {});
                    Object.keys(patients).forEach(function (id) {
                        expect(actuals[id]).to.deep.equal(patients[id]);
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            }
        });
    });

    after(function (done) {
        bbr.clearDatabase(function (err) {
            if (err) {
                done(err);
            } else {
                bbr.disconnect(function (err) {
                    done(err);
                });
            }
        });
    });
});
