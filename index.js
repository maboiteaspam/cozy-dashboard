'use strict';

var fs = require('fs-extra');
var pathExtra = require('path-extra');
var cozyLight = require('cozy-light');
var express = require('express');
var http = require('http');
var ws = require('ws');
var WebSocketServer = ws.Server;
var wss;
var server;

var configHelpers = cozyLight.configHelpers;
var npmHelpers = cozyLight.npmHelpers;
var nodeHelpers = cozyLight.nodeHelpers;

var pkg = require( pathExtra.join(__dirname, '/package.json'));

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
    var appList = configHelpers.exportApps();
    if (appList[app]) {
      res.status(500).end();
    } else {
      npmHelpers.fetchInstall(app, function addAppToConfig (err, manifest) {
        if (!err) {
          configHelpers.addApp(app, manifest);
          res.status(200).end();
        } else {
          res.status(500).end();
        }
      });
    }
  },

  /**
   */
  uninstallApp: function (req, res) {
    var app = req.body.app;
    var appList = configHelpers.exportApps();
    if (appList[app] === undefined) {
      res.status(404).end();
    } else {
      npmHelpers.uninstall(appList[app].name,
        function removeAppFromConfig (err) {
          if (!err) {
            configHelpers.removeApp(app);
            res.status(200).end();
          } else {
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
      } else {
        res.status(500).end();
      }
    });
  },

  /**
   */
  uninstallPlugin: function (req, res) {
    var plugin = req.body.plugin;
    var pluginList = configHelpers.exportPlugins();
    if (pluginList[plugin] === undefined) {
      res.status(404).end();
    } else {
      npmHelpers.uninstall(pluginList[plugin].name,
        function remotePluginFromConfig (err) {
          if (!err) {
            configHelpers.removePlugin(plugin);
            res.status(200).end();
          } else {
            res.status(500).end();
          }
        });
    }
  }
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
  options.name = pkg.displayName;
  options.host = process.env.HOST || '0.0.0.0';
  options.port = options.getPort();
  var socketPort = options.getPort();
  app.get('/rest-api', function(req, res){
    res.send('http://localhost:' + options.port);
  });
  app.get('/socket-api', function(req, res){
    res.send('ws://localhost:' + socketPort);
  });

  app.all('/rest/list-apps', controllers.listApps);
  app.all('/rest/list-plugins', controllers.listPlugins);

  app.use(express.static( pathExtra.join(__dirname, '/public') ) );
  server = http.createServer(app);
  server.listen(options.port);
  startSocket(socketPort);
  done(null, app, server);
};

var stop = function(done) {
  if ( wss ){
    wss.close();
  }
  done();
};



module.exports.start = start;
module.exports.stop = stop;
module.exports.controllers = controllers; // export for testing purpose

if ( !module.parent ){
  var port = 8080;
  var opts = {
    getPort: function(){
      return port++;
    }
  };

  var apps = {
    'cozy-labs/hello': {
      'name': 'cozy-labs/hello',
      'displayName': 'Hello',
      'version': '1.0.0',
      'url': 'http://localhost:19104/apps/hello/'
    }
  };

  var plugins = {
    'fixtures/test-plugin/': {
      'name': 'fixtures/test-plugin/',
      'displayName': 'Test',
      'version': '1.1.13',
      'template': ''
    }
  };

  configHelpers.exportApps = function(){
    return apps;
  };
  configHelpers.exportPlugins = function(){
    return plugins;
  };

  var workingDir = pathExtra.join( __dirname, '/.test-working_dir/');
  fs.removeSync(workingDir);
  fs.mkdirSync(workingDir);
  configHelpers.init(workingDir);
  start(opts,function(){
    console.log(pkg.displayName + ' started ' +
    'http://localhost:' + opts.port + '/');
    console.log('ready');
  });
}
