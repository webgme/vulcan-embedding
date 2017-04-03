/*globals require*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
var Q = require('q'),
    superagent = require('superagent'),
    SERVER_URL = 'http://127.0.0.1:8082',
    TokenGeneratorBase = require('webgme/src/server/middleware/auth/tokengeneratorbase');


function ExternalTokenGenerator(mainLogger, gmeConfig, jwt) {
    var self = this;

    TokenGeneratorBase.call(self, mainLogger, gmeConfig, jwt);

    // this.start = function (params, callback) {
    //  TODO: Send test to external key generator service.
    // };

    function getTokenUrl(userId) {
        return [
            SERVER_URL,
            'token',
            userId
        ].join('/');
    }

    this.getToken = function (userId, callback) {
        var deferred = Q.defer();

        superagent.get(getTokenUrl(userId))
            .end(function (err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    //console.log('result', res);
                    deferred.resolve(res.text);
                }
            });

        return deferred.promise.nodeify(callback);
    };
}

ExternalTokenGenerator.prototype = Object.create(TokenGeneratorBase.prototype);
ExternalTokenGenerator.prototype.constructor = ExternalTokenGenerator;

module.exports = ExternalTokenGenerator;
