/*globals*/
/*jshint node:true*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
'use strict';

var Q = require('q'),
    AuthorizerBase = require('webgme/src/server/middleware/auth/authorizerbase');


/**
 * Simple test class for AuthorizerBase. This implementation simply return full access for each call.
 * @param {GmeLogger} mainLogger
 * @param {GmeConfig} gmeConfig
 * @constructor
 */
function PassingAuthorizer(mainLogger, gmeConfig) {

    AuthorizerBase.call(this, mainLogger, gmeConfig);

    this.getAccessRights = function (userId, entityId, params, callback) {
        var deferred = Q.defer();
        if (userId === 'root') {
            deferred.resolve({
                read: true,
                write: true,
                delete: true
            });
        } else if (userId === 'guest') {
            // Guest cannot create or modify projects.
            deferred.resolve({
                read: true,
                write: false,
                delete: false
            });
        } else if (userId === 'dev') {
            // Dev can create and modify projects but not delete them.
            // Check params for type of request to make this finer masked.
            // https://github.com/webgme/webgme/blob/master/src/server/middleware/auth/authorizerbase.js
            deferred.resolve({
                read: true,
                write: true,
                delete: false
            });
        } else {
            deferred.resolve({
                read: false,
                write: false,
                delete: false
            });
        }

        return deferred.promise.nodeify(callback);
    }
}

PassingAuthorizer.prototype = Object.create(AuthorizerBase.prototype);
PassingAuthorizer.constructor = PassingAuthorizer;

module.exports = PassingAuthorizer;