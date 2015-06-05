'use strict';

var resourceVerify = require('./resource');

module.exports = exports = (function () {
    var condition = Object.create(resourceVerify);
    condition.sectionName = 'demographics';
    condition.unsupportedChecks = [];
    return condition;
})();
