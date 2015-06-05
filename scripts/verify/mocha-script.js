'use strict';

var verify = require('../verify');

it('verify bundle', function () {
    verify.verifyBundleFromModule(process.argv[3], process.argv[4]);
});
