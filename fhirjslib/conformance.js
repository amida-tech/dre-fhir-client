// Generated by CoffeeScript 1.9.1
var conformance, profile;

conformance = function(arg) {
  var baseUrl, error, http, success;
  baseUrl = arg.baseUrl, http = arg.http, success = arg.success, error = arg.error;
  return http({
    method: 'GET',
    url: baseUrl + "/metadata",
    success: success,
    error: error
  });
};

profile = (function(_this) {
  return function(arg) {
    var baseUrl, error, http, success, type;
    baseUrl = arg.baseUrl, http = arg.http, type = arg.type, success = arg.success, error = arg.error;
    return http({
      method: 'GET',
      url: baseUrl + "/Profile/" + type,
      success: success,
      error: error
    });
  };
})(this);

exports.conformance = conformance;

exports.profile = profile;
