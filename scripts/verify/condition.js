'use strict';

var _ = require('lodash');

var resourceVerify = require('./resource');

module.exports = exports = (function () {
    var condition = Object.create(resourceVerify);
    condition.sectionName = 'problems';
    condition.unsupportedChecks = [];
    condition.patient = 'patient';
    return condition;
})();

exports.pruneSource = function (resource) {
    delete resource.id;
    delete resource.identifier;
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
