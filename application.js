'use strict';

var cozyLight = require('cozy-light');
var ws = require('ws');
var WebSocketServer = ws.Server;

var configHelpers = cozyLight.configHelpers;
var npmHelpers = cozyLight.npmHelpers;
var nodeHelpers = cozyLight.nodeHelpers;

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


module.exports.connect = function(app, options){
  app.get('/rest-api', function(req, res){
    res.send('http://localhost:' + options.port);
  });
  app.get('/socket-api', function(req, res){
    res.send('ws://localhost:' + options.socketPort);
  });

  app.all('/rest/list-apps', controllers.listApps);
  app.all('/rest/list-plugins', controllers.listPlugins);
};
module.exports.openWebsocket = function(options){
  var wss = new WebSocketServer({
    host: options.host,
    port: options.socketPort
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
  return wss;
};
module.exports.controllers = controllers;
