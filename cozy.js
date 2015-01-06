'use strict';

var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var application = require('./application.js');
var ws = require('ws');
var WebSocketServer = ws.Server;

var pkg = require( pathExtra.join(__dirname, '/package.json'));

var wss;

var cozyHandler = {
  start: function(options, done, cozyLight) {

    options.name = pkg.displayName;
    options.host = process.env.HOST || '0.0.0.0';
    options.port = options.getPort();
    options.socketPort = options.getPort();

    var app = express();
    wss = new WebSocketServer({
      host: options.host,
      port: options.socketPort
    });
    cozyLight.nodeHelpers.clearCloseServer(wss);
    application.connect(app, wss, options, cozyLight);

    app.use(express.static( pathExtra.join(__dirname, '/public') ) );

    var server = http.createServer(app);
    server.listen( options.port, options.hostname || '127.0.0.1' );


    done(null, app, server);

  },
  stop: function(done) {
    if ( wss ){
      wss.close();
    }
    done();
  }
};

module.exports = cozyHandler;
