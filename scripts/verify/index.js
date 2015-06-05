'use strict';

var path = require('path');

var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

var verifierMap = {
    'allergyintolerance': require('./allergyIntolerance'),
    'condition': require('./condition'),
    'patient': require('./patient')
};

exports.verifyBundle = function (bundle) {
    var entries = bundle.entry;
    expect(entries.length).to.be.above(0);

    entries.forEach(function (entry, index) {
        console.log('verifying entry ' + index);
        var resource = entry.resource;
        var resourceType = resource.resourceType.toLowerCase();
        var resourceVerify = verifierMap[resourceType];
        expect(resourceVerify).to.exist();
        resourceVerify.run(resource);
        console.log('');
    });
};

exports.verifyBundleFromModule = function (bundleModulePath, writeIndex) {
    var p = path.join(__dirname, '../../', bundleModulePath);
    var bundle = require(p);
    if (writeIndex !== undefined) {
        console.log(JSON.stringify(bundle.entry[writeIndex].resource, undefined, 4));
    }
    exports.verifyBundle(bundle);
};
