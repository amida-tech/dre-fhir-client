'use strict';

var verify = require('../verify');

it('verify bundle', function () {
	var bundleFileOption = '--bundleFile';
	var startIndexOption = '--startIndex';

	var options = process.argv.reduce(function(r, argv) {
		if (argv.indexOf(bundleFileOption) === 0) {
			r.bundle = argv.substring(bundleFileOption.length+1);
		}
		if (argv.indexOf(startIndexOption) === 0) {
			r.start = argv.substring(startIndexOption.length+1);
		}
		return r;
	}, {});
	if (options.bundle) {
	    verify.verifyBundleFromModule(options.bundle, options.start);
	} else {
		throw new Error('Specify a bundle module with --bundleFile option');
	}
});
