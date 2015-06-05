'use strict';

var _ = require('lodash');
var bbu = require('blue-button-util');

var resourceVerify = require('./resource');

var jp = bbu.jsonpath.instance;

module.exports = exports = (function () {
    var patient = Object.create(resourceVerify);
    patient.sectionName = 'demographics';
    return patient;
})();

exports.unsupportedChecks = [{
	title: 'communication.language with no code',
	fn: function(resource) {
    	var lc = _.get(resource, 'communication[0].language.coding[0]'); // erroneous in source
    	if (lc && ! lc.code) {
    		delete resource.communication;
    		return 'warning';
    	} else {
    		return null;
    	}
	}
}, {
	title: 'null flavor ethnicity',
	fn: (function() {
		var enfjp = jp('extension[?(@.url==="http://hl7.org/fhir/StructureDefinition/us-core-ethnicity")].valueCodeableConcept.coding[0].system');

		return function(resource) {
			var enf = enfjp(resource);
			if (enf && enf.length && (enf[0] === "urn:oid:2.16.840.1.113883.5.1008")) {
				return 'fatal';
			} else {
				return null;
			}
		};
	})()
}, {
	title: 'ethnicity without code',
	fn: (function() {
		var enfjp = jp('extension[?(@.url==="http://hl7.org/fhir/StructureDefinition/us-core-ethnicity")].valueCodeableConcept.coding[0]');

		return function(resource) {
			var code = enfjp(resource);
			if (code && code[0] && (! code[0].code)) {
				return 'fatal';
			} else {
				return null;
			}
		};
	})()
}, {
	title: 'animal',
	fn: function(resource) {
		return resource.animal ? 'fatal' : null;
	}
}];

exports.pruneSource = function (resource) {
    delete resource.id;
    delete resource.meta;
    delete resource.text;

    if (resource.name) {
    	if (resource.name.length > 0) {
    		resource.name = [resource.name[0]];
    	}

    	resource.name.forEach(function(name) {
    		delete name.text;
    		delete name.use;
    	});
    }
    if (resource.address) {
    	resource.address.forEach(function(address) {
    		delete address.text;
    	});
    }
    if (resource.identifier) {
    	resource.identifier.forEach(function(identifier) {
    		delete identifier.label;
    	});
    }
    if (resource.identifier) {
    	resource.identifier.forEach(function(identifier) {
    		delete identifier.use;
    		delete identifier.assigner,
    		delete identifier.period
    	});
    }

    delete resource.managingOrganization;
    delete resource.contact;
    delete resource.link;
    delete resource.active;
    delete resource._gender;
    delete resource.deceasedBoolean;
    delete resource.careProvider;
};
