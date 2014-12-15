'use strict';

var pathExtra = require('path-extra');
var express = require('express');
var http = require('http');
var application = require('./application.js');

var pkg = require( pathExtra.join(__dirname, '/package.json'));

var wss;

var cozyHandler = {
  start: function(options, done) {
    var app = express();
    options.name = pkg.displayName;
    options.host = process.env.HOST || '0.0.0.0';
    options.port = options.getPort();
    options.socketPort = options.getPort();

    application.connect(app, options);
    app.use(express.static( pathExtra.join(__dirname, '/public') ) );

    var server = http.createServer(app);
    server.listen( options.port, options.hostname || '127.0.0.1' );

    wss = application.openWebsocket(options);

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
