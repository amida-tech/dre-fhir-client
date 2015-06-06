'use strict';

var path = require('path');

var chai = require('chai');
var dirtyChai = require('dirty-chai');
var _ = require('lodash');

chai.use(dirtyChai);
var expect = chai.expect;

var verifierMap = {
    'allergyintolerance': require('./allergyIntolerance'),
    'condition': require('./condition'),
    'patient': require('./patient'),
    'observation': require('./observation')
};

exports.verifyBundle = function (bundle, startIndex) {
    var entries = bundle.entry;
    if (startIndex === undefined) {
        startIndex = 0;
    }
    expect(entries.length).to.be.above(startIndex);

    _.range(startIndex, entries.length).forEach(function (index) {
        var entry = entries[index];
        console.log('verifying entry ' + index);
        var resource = entry.resource;
        var resourceType = resource.resourceType.toLowerCase();
        var resourceVerify = verifierMap[resourceType];
        expect(resourceVerify).to.exist();
        resourceVerify.run(resource);
        console.log('');
    });
};

exports.verifyBundleFromModule = function (bundleModulePath, errorIndex) {
    var p = path.join(__dirname, '../../', bundleModulePath);
    var bundle = require(p);
    if (errorIndex !== undefined) {
        console.log(JSON.stringify(bundle.entry[errorIndex].resource, undefined, 4));
    }
    exports.verifyBundle(bundle, errorIndex);
};
