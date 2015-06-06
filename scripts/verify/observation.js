'use strict';

var _ = require('lodash');
var bbr = require('blue-button-fhir');

var resourceVerify = require('./resource');

module.exports = exports = (function () {
    var observation = Object.create(resourceVerify);
    observation.sectionName = function(resource) {
    	return bbr.classifyResource(resource);
    };
    observation.unsupportedChecks = [];
    observation.patient = 'subject';
    return observation;
})();

var pruneQuantity = function(path) {
	return function(resource) {
		var q = _.get(resource, path);
		if (q) {
			if ((q.code !== undefined) || (q.system !== undefined)) {
				delete q.code;
				delete q.system;
				return 'warning';
			} else {
				return null;
			}
		} else {
			return null;
		}
	};
};

exports.unsupportedChecks = [{
	title: 'appliesDateTime',
	fn: function(resource) {
    	var adt = resource.appliesDateTime;
    	if (adt) {
    		delete resource.appliesDateTime;
    		return 'warning';
    	} else {
    		return null;
    	}
	}
}, {
	title: 'multiple code.coding and/or code.coding.primary',
	fn: function(resource) {
		var coding = _.get(resource, 'code.coding');
		if (coding && (coding.length > 1) || (coding[0] && coding[0].primary !== undefined)) {
			if (coding.length > 1) {
				coding.splice(1, coding.length-1);
			}
			delete coding[0].primary;
			return 'warning';
		} else {
			return null;
		}
	}
}, {
	title: 'valueQuantity.code and/or valueQuantity.system',
	fn: pruneQuantity('valueQuantity')
}, {
	title: 'referenceRange[0].low.code and/or referenceRange[0].low.system',
	fn: pruneQuantity('referenceRange[0].low')
}, {
	title: 'referenceRange[0].high.code and/or referenceRange[0].high.system',
	fn: pruneQuantity('referenceRange[0].high')
}, {
	title: 'http://hl7.org/fhir/v2/0078 converted to http://hl7.org/fhir/v3/ObservationInterpretation',
	fn: function(resource) {
		var system = _.get(resource, 'interpretation.coding[0].system');
		if (system === 'http://hl7.org/fhir/v2/0078') {
			return 'warning';
		} else {
			return null;
		}
	}
}, {
	title: 'valueCodeableConcept',
	fn: function(resource) {
		if (resource.valueCodeableConcept) {
			return 'fatal';
		} else {
			return null;
		}
	}
}, {
	title: 'dataAbsentReason',
	fn: function(resource) {
		if (resource.dataAbsentReason) {
			delete resource.dataAbsentReason;
			return 'warning';
		} else {
			return null;
		}
	}
}];

exports.pruneSource = function (resource) {
    delete resource.id;
    delete resource.identifier;
    delete resource.subject;
    delete resource.meta;
    delete resource.text;
    delete resource.related;
    delete resource.encounter;
};

exports.pruneTranslation = function (resource, srcResource) {
	this.updateText(resource, srcResource, 'code.text');
	this.updateText(resource, srcResource, 'interpretation.text');

	var srcInterpretation = _.get(srcResource, 'interpretation.coding[0]');
	if (srcInterpretation) {
		var targetInterpretation = _.get(resource, 'interpretation.coding[0]');
    	if (! srcInterpretation.display) {
			if (targetInterpretation) {
				delete targetInterpretation.display;
    		}
    	}
    	console.log(srcInterpretation.system);
    	if (srcInterpretation.system ===  "http://hl7.org/fhir/v2/0078") {
    		targetInterpretation.system = "http://hl7.org/fhir/v2/0078";
    	}
    }
};
