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
    var unsupportedChecks = [{
        title: '  Uncoded substance is not supported',
        fn: function (resource) {
            return _.get(resource, 'substance.coding', null) === null;
        }
    }];

    return function (resource) {
        var n = unsupportedChecks.length;
        for (var i = 0; i < n; ++i) {
            var check = unsupportedChecks[i];
            if (check.fn(resource)) {
                console.log(check.title);
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
};

var addExpectedChanges = function (resource) {

};

var pruneTranslation = function (resource) {
    if (_.get(resource, 'substance.text', null) !== null) {
        delete resource.substance.text;
    }
    if (resource.event) {
        resource.event.forEach(function (event) {
            if (event.manifestation) {
                event.manifestation.forEach(function (manifestation) {
                    delete manifestation.text;
                });
            }
        });
    }
};

module.exports = function (resource) {
    sanityChecks(resource);

    if (isSupported(resource)) {
        var entry = bbf.resourceToModelEntry(resource, 'allergies');
        expect(entry).to.exist();

        var resourceBack = bbgf.entryToResource('allergies', entry);
        expect(resourceBack).to.exist();

        var resourceCopy = _.cloneDeep(resource);

        pruneSource(resourceCopy);
        addExpectedChanges(resourceCopy);
        pruneTranslation(resourceBack);

        expect(resourceBack).to.deep.equal(resourceCopy);
    }
};
