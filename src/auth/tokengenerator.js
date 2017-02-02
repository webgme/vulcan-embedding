/*globals require*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
var Q = require('q'),
    superagent = require('superagent'),
    TOKEN_NONCE = 'aVeryLongAndRandomSecret',
    SERVER_URL = 'http://127.0.0.1:8082/token',
    TokenGeneratorBase = require('webgme/src/server/middleware/auth/tokengeneratorbase');


function ExternalTokenGenerator(mainLogger, gmeConfig, jwt) {
    var self = this;

    TokenGeneratorBase.call(self, mainLogger, gmeConfig, jwt);

    // this.start = function (params, callback) {
    //  TODO: Send test to external key generator service.
    // };

    this.getToken = function (content, options, callback) {
        var deferred = Q.defer(),
            payload = {
                nonce: TOKEN_NONCE,
                content: content,
                options: options
            };

        superagent.post(SERVER_URL)
            .send(payload)
            .end(function (err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res.body);
                }
            });

        return deferred.promise.nodeify(callback);
    };
}

ExternalTokenGenerator.prototype = Object.create(TokenGeneratorBase.prototype);
ExternalTokenGenerator.prototype.constructor = ExternalTokenGenerator;

module.exports = ExternalTokenGenerator;
