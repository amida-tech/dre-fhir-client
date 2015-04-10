'use strict';

var fs = require('fs');
var path = require('path');
var chai = require('chai');
var _ = require('lodash');

var bbfhir = require('blue-button-fhir');
var bbgenfhir = require('blue-button-gen-fhir');
var bbu = require('blue-button-util');

var jp = bbu.jsonpath.instance;

var drefc = require('../index');

var expect = chai.expect;

describe('bundle translate and back', function () {
    var ignore = {
        "258": "wrong communication",
        "2985": 'to be reviewed',
        "2986": 'to be reviewed',
        "2987": 'to be reviewed',
        "2988": 'to be reviewed',
        "2989": 'not supprted link'
    };

    var deleteElems = function (obj, keys) {
        keys.forEach(function (key) {
            delete obj[key];
        });
    };

    it('patients_bundle', function () {
        this.timeout(20000);
        var json = require('../generated/patients_bundle.json');

        var languageCoding = jp('communication[0].language.coding[0]');
        var ethnicityNullFlavor = jp('extension[?(@.url==="http://hl7.org/fhir/StructureDefinition/us-core-ethnicity")].valueCodeableConcept.coding[0].system');

        for (var i = 0; i < 200; ++i) {
            var patientBundle = {
                resourceType: 'Bundle',
                total: 1,
                entry: [
                    json.entry[i]
                ]
            };
            var model = bbfhir.toModel(patientBundle);
            var fhir = bbgenfhir.modelToFHIR(model);

            var actual = fhir.entry[0].resource;
            var expected = _.clone(json.entry[i].resource);

            console.log(i + ' ' + expected.id);

            var lc = languageCoding(expected);
            if (lc && (!lc.code)) {
                console.log('  language code missing');
                continue;
            }
            var enf = ethnicityNullFlavor(expected);
            if (enf && enf.length && (enf[0] === "urn:oid:2.16.840.1.113883.5.1008")) {
                console.log('  null flavor ethnicity');
                continue;
            }
            if (expected.animal) {
                console.log('  animal');
                continue;
            }

            if (ignore[expected.id]) {
                continue;
            }

            deleteElems(expected, ['meta', 'id', 'text', 'managingOrganization']);
            deleteElems(actual, ['id']);

            expect(actual).to.deep.equal(expected);
        }
    });
});
