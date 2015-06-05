'use strict';

var bbf = require('blue-button-fhir');
var bbgf = require('blue-button-gen-fhir');

var resourceVerify = require('./resource');

var _ = require('lodash');
var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

module.exports = exports = (function() {
    var allergyIntolerance = Object.create(resourceVerify);
    allergyIntolerance.sectionName = 'allergies';
    allergyIntolerance.unsupportedChecks = [];
    allergyIntolerance.patient = 'patient';
    return allergyIntolerance;
})();

exports.pruneSource = function (resource) {
    delete resource.id;
    delete resource.identifier; // to be fixed
    delete resource.patient;
    delete resource.meta;
    delete resource.text;
};

exports.addExpectedChanges = function (resource) {
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

exports.pruneTranslation = function (resource, srcResource) {
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
