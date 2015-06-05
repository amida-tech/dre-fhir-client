'use strict';

var bbf = require('blue-button-fhir');
var bbgf = require('blue-button-gen-fhir');

var _ = require('lodash');
var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

var sanityChecks = function (resource) {
    expect(resource.patient).to.exist();
    expect(resource.patient.reference).to.exist();
};

var isSupported = (function () {
    var unsupportedChecks = [];

    return function (resource) {
        var n = unsupportedChecks.length;
        for (var i = 0; i < n; ++i) {
            var check = unsupportedChecks[i];
            if (check.fn(resource)) {
                console.log('  unsupported: ' + check.title);
                return false;
            }
        }
        return true;
    };
})();

var pruneSource = function (resource) {
    delete resource.id;
    delete resource.identifier; // to be fixed
    delete resource.patient;
    delete resource.meta;
    delete resource.text;
    delete resource.encounter;

    delete resource.clinicalStatus;
    delete resource.abatementBoolean;
    delete resource.asserter;

    var coding = _.get(resource, 'code.coding');
    if (coding && (coding.length > 1)) {
        resource.code.coding = [resource.code.coding[0]];
    }
};

var addExpectedChanges = function (resource) {};

var pruneTranslation = function (resource, srcResource) {
    if (_.get(srcResource, 'code.text', null) === null) {
        delete resource.code.text;
    }
    delete resource.clinicalStatus;
    delete resource.dateAsserted;
};

exports.run = function (resource) {
    sanityChecks(resource);

    if (isSupported(resource)) {
        var entry = bbf.resourceToModelEntry(resource, 'problems');
        expect(entry).to.exist();

        var resourceBack = bbgf.entryToResource('problems', entry);
        expect(resourceBack).to.exist();

        var resourceCopy = _.cloneDeep(resource);

        pruneSource(resourceCopy);
        addExpectedChanges(resourceCopy);
        pruneTranslation(resourceBack, resourceCopy);

        expect(resourceBack).to.deep.equal(resourceCopy);
        console.log('  verified');
    }
};
