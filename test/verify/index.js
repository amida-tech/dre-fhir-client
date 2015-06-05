'use strict';

var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

var verifierMap = {
    'allergyintolerance': require('./allergyIntolerance'),
    'condition': require('./condition')
};

exports.verifyBundle = function (bundle) {
    var entries = bundle.entry;
    expect(entries.length).to.be.above(0);

    entries.forEach(function (entry, index) {
        console.log('verifying entry ' + index);
        var resource = entry.resource;
        var resourceType = resource.resourceType.toLowerCase();
        var resourceVerify = verifierMap[resourceType];
        resourceVerify(resource);
        console.log('');
    });
};
