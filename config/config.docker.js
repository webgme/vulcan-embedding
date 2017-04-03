'use strict';

var path = require('path'),
    config = require('./config.default'),
    validateConfig = require('webgme/config/validator');

// Settings specifically for docker container

// 1. The token keys should live outside of the container.
config.authentication.jwt.privateKey = '/dockershare/keys/EXAMPLE_PRIVATE_KEY';
config.authentication.jwt.publicKey = '/dockershare/keys/EXAMPLE_PUBLIC_KEY';
// 2. Logs should be written to the outside.
config.server.log = {
                transports: [{
                    transportType: 'File',
                    options: {
                        name: 'info-file',
                        filename: '/dockershare/logs/server.log',
                        level: 'info', // This can be set to debug too.
                        json: false
                    }
                }, {
                    transportType: 'File',
                    options: {
                        name: 'error-file',
                        filename: '/dockershare/logs/server-error.log',
                        level: 'error',
                        handleExceptions: true,
                        json: false
                    }
                }]
            };
// 3. Blob files should be put outside..
config.blob.fsDir = '/dockershare/blob-local-storage';

// This is the exposed port from the docker container.
config.server.port = 8888;


// Connect to the linked mongo container N.B. container must be named mongo
config.mongo.uri = 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT + '/multi';

validateConfig(config);
module.exports = config;
