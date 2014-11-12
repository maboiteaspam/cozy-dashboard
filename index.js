'use strict';

var cozyLight = require('cozy-light');
var express = require('express');
var http = require('http');
var ws = require('ws');
var WebSocketServer = ws.Server;
var rest_app;
var wss;
var server;
var intervals = [];

var actions = cozyLight.actions;
var configHelpers = cozyLight.configHelpers;
var npmHelpers = cozyLight.npmHelpers;
var nodeHelpers = cozyLight.nodeHelpers;

var apps = [{
  displayName:'test',
  url:'http://localhost:19104/apps/test/',
  version:'0.0.'
},{
  displayName:'test 2',
  url:'http://localhost:19104/apps/test/',
  version:'0.0.'
}];

var plugins = [{
  displayName:'test 3',
  version:'0.0.'
},{
  displayName:'test 4',
  version:'0.0.'
}];


var controllers = {

  /**
   */
  listApps: function (req, res) {
    res.send(configHelpers.exportApps());
  },

  /**
   */
  listPlugins: function (req, res) {
    res.send(configHelpers.exportPlugins());
  },

  /**
   */
  installApp: function (req, res) {
    var app = req.body.app;
    var apps = configHelpers.exportApps();
    if (apps[app]) {
      res.status(500).end();
    }else{
      npmHelpers.fetchInstall(app, function addAppToConfig (err, manifest) {
        if (!err) {
          configHelpers.addApp(app, manifest);
          res.status(200).end();
        }else{
          res.status(500).end();
        }
      });
    }
  },

  /**
   */
  uninstallApp: function (req, res) {
    var app = req.body.app;
    var apps = configHelpers.exportApps();
    if (apps[app] === undefined) {
      res.status(404).end();
    } else {
      npmHelpers.uninstall(app, function removeAppFromConfig (err) {
        if (!err) {
          configHelpers.removeApp(app);
          res.status(200).end();
        }else{
          res.status(500).end();
        }
      });
    }
  },

  /**
   */
  installPlugin: function (req, res) {
    var plugin = req.body.plugin;
    npmHelpers.fetchInstall(plugin, function addPluginToConfig (err, manifest) {
      if (!err) {
        configHelpers.addPlugin(plugin, manifest);
        res.status(200).end();
      }else{
        res.status(500).end();
      }
    });
  },

  /**
   */
  uninstallPlugin: function (req, res) {
    var plugin = req.body.plugin;
    var plugins = configHelpers.exportPlugins();
    if (plugins[plugin] === undefined) {
      res.status(404).end();
    } else {
      npmHelpers.uninstall(plugin, function remotePluginFromConfig (err) {
        if (!err) {
          configHelpers.removePlugin(plugin);
          res.status(200).end();
        }else{
          res.status(500).end();
        }
      });
    }
  }
};




var restServer = function(options, done) {
  rest_app = express();
  options.port = options.getPort();

  rest_app.all('/rest/list-apps', function(){
    res.send(apps);
  });
  rest_app.all('/rest/list-plugins', function(){
    res.send(plugins);
  });
  rest_app.listen(options.port,options.host);
  console.log("Rest started http://localhost:"+options.port+"/");
  done('http://'+options.host+':'+options.port);
};

var socketServer = function(options, done) {
  options.name = 'DashboardServer';
  options.host = process.env.HOST || "0.0.0.0";
  options.port = options.getPort();
  console.log("Socket started http://localhost:"+options.port+"/");
  wss = new WebSocketServer({
    host: options.host,
    port: options.port
  });
  wss.on('connection', function(ws) {
    var emit = function(m,d){
      var event = {
        message:m,
        data:d
      };
      ws.send( JSON.stringify(event) );
    };
    var sendApplicationList = function(){
      emit('applicationList', apps);
    };
    var sendPluginList = function(){
      emit('pluginList', plugins);
    };
    var sendMemoryValue = function(){
      var memoryUsage = process.memoryUsage();
      var memory = {
        value: Math.ceil(memoryUsage.heapUsed / 1000000),
        unit: 'MB'
      };
      emit('memoryChanged', memory);
    };

    sendPluginList();
    sendApplicationList();
    sendMemoryValue();
    var interval = setInterval(sendMemoryValue,2500);
    intervals.push(interval);
    ws.on('close', function() {
      clearInterval(interval);
    });
  });
  done('ws://'+options.host+':'+options.port);
};

var startSocket = function(port) {
  wss = new WebSocketServer({
    host: 'localhost',
    port: port
  });
  wss.on('connection', function(ws) {
    var emit = function(m, d){
      var event = {
        message: m,
        data: d
      };
      ws.send( JSON.stringify(event) );
    };
    var sendApplicationList = function(){
      emit('applicationList', configHelpers.exportApps());
    };
    var sendPluginList = function(){
      emit('pluginList', configHelpers.exportPlugins());
    };
    var sendMemoryValue = function(){
      var memoryUsage = process.memoryUsage();
      var memory = {
        value: Math.ceil(memoryUsage.heapUsed / 1000000),
        unit: 'MB'
      };
      emit('memoryChanged', memory);
    };

    sendPluginList();
    sendApplicationList();
    sendMemoryValue();
    var socketInterval = setInterval(sendMemoryValue,2500);
    ws.on('close', function() {
      clearInterval(socketInterval);
    });
  });
  nodeHelpers.clearCloseServer(wss);
};
var start = function(options, done) {
  var app = express();
  options.name = 'Dashboard';
  options.host = process.env.HOST || "0.0.0.0";
  options.port = options.getPort();
  var socket_port = options.getPort();
  app.get('/rest-api', function(req, res){
    res.send('http://localhost:'+options.port);
  });
  app.get('/socket-api', function(req, res){
    res.send('ws://localhost:'+socket_port);
  });

  app.all('/rest/list-apps', controllers.listApps);
  app.all('/rest/list-plugins', controllers.listPlugins);

  app.use(express.static(__dirname + '/public'));
  server = http.createServer(app);
  server.listen(options.port);
  startSocket(socket_port);
  done(null, app, server);
};

var stop = function(done) {
  if( wss ) wss.close();
  done();
};

var start_test = function(options, done) {
  restServer(options,function(rest_api){
    options.rest_api = rest_api;
    socketServer(options,function(socket_api){
      options.socket_api = socket_api;
      start(options, done);
    });
  });
};

var stop_test = function(done) {
  intervals.forEach(function(interval){
    clearInterval(interval);
  });
  if( wss ) wss.close();
  if( rest_app ) rest_app.close();
  done();
};

module.exports.start = start;
module.exports.stop = stop;
module.exports.controllers = controllers;

if( !module.parent ){
  var port = 8080;
  var opts = {
    getPort:function(){
      return port++;
    },
    'rest_api': 'http://localhost:8080/',
    'socket_api': 'http://localhost:8081/'
  };
  start_test(opts,function(){
    console.log("Dashboard started http://localhost:"+opts.port+"/");
    console.log("ready")
  });
}