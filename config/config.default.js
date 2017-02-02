'use strict';

var path = require('path'),
    config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
config.authentication.enable = true;
config.authentication.authorizer.path = path.join(__dirname, '../src/auth/authorizer');
config.authentication.jwt.tokenGenerator = path.join(__dirname, '../src/auth/tokengenerator');
config.authentication.jwt.privateKey = path.join(__dirname, '../dockershare/keys/EXAMPLE_PRIVATE_KEY');
config.authentication.jwt.publicKey = path.join(__dirname, '../dockershare/keys/EXAMPLE_PUBLIC_KEY');
validateConfig(config);
module.exports = config;