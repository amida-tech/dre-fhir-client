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
        var result = check.fn(resource);
        if (result) {
            console.log('  unsupported (' + result + '): ' + check.title);
            if (result === 'fatal') {
                return false;
            }
        }
    }
    return true;
};

exports.pruneSource = function (resource) {
};

exports.pruneTranslation = function (resource, srcResource) {
};

exports.addExpectedChanges = function (resource) {};

exports.toEntry = function(resource) {
    var sectionName = this.sectionName;
    sectionName = (typeof sectionName === 'function') ? sectionName(resource) : sectionName;
    var entry = bbf.resourceToModelEntry(resource, sectionName);
    return entry;
};

exports.toResource = function(entry, displayResource) {
    var sectionName = this.sectionName;
    var resource = bbgf.entryToResource(sectionName, entry);
    if (displayResource) {
        console.log('====== Translated Resource');
        console.log(JSON.stringify(resource, undefined, 4));
        console.log('======');
    }
    return resource;
};

exports.run = function (resource, displayEntry) {
    this.sanityChecks(resource);

    if (this.isSupported(resource)) {
        var entry = this.toEntry(resource, displayEntry);
        expect(entry).to.exist();

        var resourceBack = this.toResource(entry, displayEntry);
        expect(resourceBack).to.exist();

        var resourceCopy = _.cloneDeep(resource);

        this.pruneSource(resourceCopy);
        this.addExpectedChanges(resourceCopy);
        this.pruneTranslation(resourceBack, resourceCopy);

        expect(resourceBack).to.deep.equal(resourceCopy);
        console.log('  verified');
    }
};

exports.updateText = function (resource, srcResource, path) {
    var codeText = _.get(srcResource, path);
    if (! codeText) {
        codeText = undefined;
        _.set(srcResource, path, undefined);
    }
    _.set(resource, path, codeText);
};

exports.unsupportedFieldWarningCheck = function(path) {
    return {
        title: path,
        fn: function(resource) {
            if (_.has(resource, path)) {
                var pieces = path.split('.');
                var obj = resource;
                var n = pieces.length;
                var p = pieces[n-1];
                if (n > 1) {
                    var pathBefore = pieces.slice(0, n-1).join('.');
                    obj = _.get(obj, pathBefore);
                }
                if (obj) {
                    delete obj[p];
                }
                return 'warning';
            } else {
                return null;
            }
        }
    };
};

