'use strict';

var bbf = require('blue-button-fhir');
var bbgf = require('blue-button-gen-fhir');

var _ = require('lodash');
var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

module.exports = exports = {};

exports.sanityChecks = function (resource) {
    var p = this.patient;
    if (p) {
        expect(resource[p]).to.exist();
        expect(resource[p].reference).to.exist();
    }
};

exports.isSupported = function (resource) {
    var n = this.unsupportedChecks.length;
    for (var i = 0; i < n; ++i) {
        var check = this.unsupportedChecks[i];
        if (check.fn(resource)) {
            console.log('  unsupported: ' + check.title);
            return false;
        }
    }
    return true;
};

exports.addExpectedChanges = function (resource) {};

exports.run = function (resource) {
    this.sanityChecks(resource);

    if (this.isSupported(resource)) {
        var sectionName = this.sectionName;
        var entry = bbf.resourceToModelEntry(resource, sectionName);
        expect(entry).to.exist();

        var resourceBack = bbgf.entryToResource(sectionName, entry);
        expect(resourceBack).to.exist();

        var resourceCopy = _.cloneDeep(resource);

        this.pruneSource(resourceCopy);
        this.addExpectedChanges(resourceCopy);
        this.pruneTranslation(resourceBack, resourceCopy);

        expect(resourceBack).to.deep.equal(resourceCopy);
        console.log('  verified');
    }
};
