/*globals*/
/**
 * This file does three things
 * 1) Starts a webgme-server at the default port (8888)
 * 2) Creates and starts a server (at EMBEDDER_PORT) serving single page embedding the webgme app (see static/index.html)
 * 3) Creates and starts a "public" reverse-proxy server (at PROXY_PORT) forwarding requests two the above servers.
 * 4) Creates and starts a token generating server (at TOKEN_GEN_PORT) generating tokens on requests.
 *
 * @author pmeijer / https://github.com/pmeijer
 */

var PROXY_PORT = 8080,
    EMBEDDER_PORT = 8081,
    TOKEN_GEN_PORT = 8082,
    TOKEN_NONCE = 'aVeryLongAndRandomSecret';

// 1 ) webgme sever
var gmeConfig = require('./config');
var webgme = require('webgme');

webgme.addToRequireJsPaths(gmeConfig);

var webgmeServer = new webgme.standaloneServer(gmeConfig);

webgmeServer.start(function () {

});

// 2) embedder of webgme
var express = require('express');
var embedServer = express();
var path = require('path');

embedServer.get('/embedder', function (req, res) {
    res.sendFile(path.join(process.cwd(), 'static/index.html'));
});

embedServer.listen(EMBEDDER_PORT, function () {
    console.log('Embedder app listening at', EMBEDDER_PORT);
});

// 3) proxy server
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({
    ws: true
});

var http = require('http');

var proxyServer = http.createServer(function (req, res) {
    console.log(req.url);
    // N.B. embedder cannot (and will not) collide with any webgme paths.
    if (req.url === '/embedder') {
        proxy.web(req, res, {
            target: 'http://127.0.0.1:' + EMBEDDER_PORT
        });
    } else {
        proxy.web(req, res, {
            target: 'http://127.0.0.1:' + gmeConfig.server.port
        });
    }
});

proxyServer.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head, {
        target: 'http://127.0.0.1:' + gmeConfig.server.port
    });
});

proxyServer.listen(PROXY_PORT);
console.log('Proxy server listening at', PROXY_PORT);


// 4) token generator
var tokenGenServer = express(),
    jwt = require('jsonwebtoken'),
    bodyParser = require('bodyparser'),
    fs = require('fs'),
    privateKeyPath = path.join(__dirname, '../dockershare/keys/EXAMPLE_PRIVATE_KEY'),
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');


tokenGenServer.use(bodyParser.json());

tokenGenServer.post('/token', function (req, res) {
    if (reg.body.nonce !== TOKEN_NONCE) {
        res.sendStatus(403);
    } else {
        jwt.sign(req.body.content, privateKey, req.body.options, function (err, key) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                console.log(key);
                res.send(key);
            }
        });
    }
});

tokenGenServer.listen(TOKEN_GEN_PORT, function () {
    console.log('Token generator app listening at', TOKEN_GEN_PORT);
});