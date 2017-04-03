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
    TOKEN_GEN_PORT = 8082;

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
var ejs = require('ejs');
var indexHtmlPath = path.join(process.cwd(), 'static/index.html');

embedServer.get('/embedder', function (req, res) {
    fs.readFile(indexHtmlPath, 'utf8', function (err, indexTemp) {
        if (err) {
            logger.error(err);
            res.send(404);
        } else {
            res.contentType('text/html');
            res.send(ejs.render(indexTemp, {
                token: req.query.token || ''
            }));
        }
    });
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
    //console.log(req.url);
    // N.B. embedder cannot (and will not) collide with any webgme paths.
    if (req.url === '/embedder' || req.url.indexOf('/embedder?token=') === 0) {
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
    bodyParser = require('body-parser'),
    fs = require('fs'),
    privateKeyPath = path.join(__dirname, 'dockershare/keys/EXAMPLE_PRIVATE_KEY'),
    privateKey = fs.readFileSync(privateKeyPath, 'utf8'),
    // TODO: The algorithm is hard-coded in webgme..
    jwtOptions = {
        algorithm: gmeConfig.authentication.jwt.algorithm,
        expiresIn: gmeConfig.authentication.jwt.expiresIn
    };

['dev', 'root'].forEach(function (userId) {
    jwt.sign({userId: userId}, privateKey, jwtOptions, function (err, token) {
        if (err) {
            console.log(err);
        } else {
            console.log('Token for', userId, '\n', token, '\n');
        }
    });
});


tokenGenServer.use(bodyParser.json());

tokenGenServer.get('/token/:userId', function (req, res) {
    jwt.sign({userId: req.params.userId}, privateKey, jwtOptions, function (err, token) {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            //console.log('generated new token', token);
            res.send(token);
        }
    });
});

tokenGenServer.listen(TOKEN_GEN_PORT, function () {
    console.log('Token generator app listening at', TOKEN_GEN_PORT);
});