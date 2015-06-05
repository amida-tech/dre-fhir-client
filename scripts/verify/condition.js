'use strict';

var bbf = require('blue-button-fhir');
var bbgf = require('blue-button-gen-fhir');

var resourceVerify = require('./resource');

var _ = require('lodash');
var chai = require('chai');
var dirtyChai = require('dirty-chai');

chai.use(dirtyChai);
var expect = chai.expect;

module.exports = exports = (function () {
    var condition = Object.create(resourceVerify);
    condition.sectionName = 'problems';
    condition.unsupportedChecks = [];
    condition.patient = 'patient';
    return condition;
})();

exports.pruneSource = function (resource) {
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

exports.pruneTranslation = function (resource, srcResource) {
    if (_.get(srcResource, 'code.text', null) === null) {
        delete resource.code.text;
    }
    delete resource.clinicalStatus;
    delete resource.dateAsserted;
};
