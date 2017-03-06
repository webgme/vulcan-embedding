'use strict';

var path = require('path'),
    config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
config.authentication.enable = true;
config.authentication.authorizer.path = path.join(__dirname, '../src/auth/authorizer');
config.visualization.extraCss.push('./vulcan-example/vulcan.css');
validateConfig(config);
module.exports = config;