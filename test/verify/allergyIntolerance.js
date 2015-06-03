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
};

var addExpectedChanges = function (resource) {
    // one manifestation per event
    if (_.get(resource, 'event[0].manifestation[0]')) {
        var newEvents = resource.event.reduce(function (r, event) {
            var n = event.manifestation && event.manifestation.length;
            if (n > 1) {
                var extraManifestations = event.manifestation.splice(1, n - 1);
                extraManifestations.forEach(function (manifestation) {
                    var newEvent = _.cloneDeep(event);
                    newEvent.manifestation = [manifestation];
                    r.push(newEvent);
                });
            }
            return r;
        }, []);
        Array.prototype.push.apply(resource.event, newEvents);
    }
};

var pruneTranslation = function (resource, srcResource) {
    if (_.get(srcResource, 'substance.text', null) === null) {
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
        pruneTranslation(resourceBack, resourceCopy);

        expect(resourceBack).to.deep.equal(resourceCopy);
        console.log('  verified');
    }
};
