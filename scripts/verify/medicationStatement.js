'use strict';

var _ = require('lodash');

var bbf = require('blue-button-fhir');
var bbgf = require('blue-button-gen-fhir');

var resourceVerify = require('./resource');

module.exports = exports = (function () {
    var medicationStatement = Object.create(resourceVerify);
    medicationStatement.sectionName = 'medicationsNew';
    medicationStatement.unsupportedChecks = [];
    medicationStatement.patient = 'patient';
    return medicationStatement;
})();

exports.toDocument = function (resources) {
    var entry = resources.map(function (resource) {
        return {
            resource: resource
        };
    });
    var result = {
        resourceType: 'Bundle',
        type: 'document',
        total: resources.length,
        entry: entry
    };
    return result;
};

exports.toEntry = function(resource, displayEntry) {
    var bundle = this.toDocument([resource]);
    var model = bbf.toModel(bundle);
    var medication = model && _.get(model, 'data.medications[0]');
    if (displayEntry) {
        console.log('====== Translated Entry');
    	console.log(JSON.stringify(medication, undefined, 4));
        console.log('======');
    }
    return medication;
};

exports.unsupportedChecks = [
	resourceVerify.unsupportedFieldWarningCheck('informationSource'),
	resourceVerify.unsupportedFieldWarningCheck('dateAsserted'),
	resourceVerify.unsupportedFieldWarningCheck('dosage[0].quantity.code'),
	resourceVerify.unsupportedFieldWarningCheck('dosage[0].quantity.system'),
	resourceVerify.unsupportedFieldWarningCheck('dosage[0].schedule.repeat.bounds'),
	resourceVerify.unsupportedFieldWarningCheck('dosage[0].extension')
];

exports.pruneSource = function (resource) {
    delete resource.id;
    delete resource.identifier;
    delete resource.patient;
    delete resource.meta;
    delete resource.text;
};

exports.pruneTranslation = function (resource, srcResource) {
	this.updateText(resource, srcResource, 'dosage[0].route.text');
	this.updateText(resource, srcResource, 'medication.display');
	this.updateText(resource, srcResource, 'contained[0].name');
	this.updateText(resource, srcResource, 'contained[0].code.text');
};
