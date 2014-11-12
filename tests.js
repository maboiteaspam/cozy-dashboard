'use strict';
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var express = require('express');
var bodyParser = require('body-parser');
var index = require('./index.js');
var controllers = index.controllers;
var supertest = require('supertest');

var cozyLight = require('cozy-light');

var actions = cozyLight.actions;
//var controllers = cozyLight.controllers;
var configHelpers = cozyLight.configHelpers;
var npmHelpers = cozyLight.npmHelpers;
var applicationHelpers = cozyLight.applicationHelpers;
//var mainAppHelper = cozyLight.mainAppHelper;

var workingDir = pathExtra.join( __dirname, '/.test-working_dir/');
var fixturesDir = pathExtra.join( __dirname, '/fixtures/');
var HOME = workingDir;
var cozyHOME = pathExtra.join(HOME, '.cozy-light' );


before(function(){
  fs.removeSync(workingDir);
  fs.mkdirSync(workingDir);
  configHelpers.init(workingDir);
  configHelpers.loadConfigFile();
});


after(function(){
  fs.removeSync(workingDir);
});


describe('Controllers', function () {

  var app = express();
  var jsonParser = bodyParser.json();
  var urlencodedParser = bodyParser.urlencoded({ extended: false });
  app.use(urlencodedParser);
  app.use(jsonParser);
  app.use('/list-apps', controllers.listApps);
  app.use('/install-app', controllers.installApp);
  app.use('/uninstall-app', controllers.uninstallApp);
  app.use('/list-plugins', controllers.listPlugins);
  app.use('/install-plugin', controllers.installPlugin);
  app.use('/uninstall-plugin', controllers.uninstallPlugin);

  it.skip('index', function(){
  });

  it.skip('proxyPrivate', function(){
  });

  it.skip('proxyPublic', function(){
  });

  it.skip('automaticRedirect', function(){
  });

  describe('install', function () {
    it('should install app', function (done) {
      this.timeout(10000);
      supertest( app )
        .post('/install-app')
        .send({app:'cozy-labs/hello'})
        .expect(200, done);
    });
    it('should install plugin', function (done) {
      this.timeout(10000);
      var test = pathExtra.join('fixtures/', 'test-plugin/');
      supertest( app )
        .post('/install-plugin')
        .send({plugin:test})
        .expect(200, done);
    });
  });

  describe('list', function () {
    it('apps', function (done) {
      this.timeout(10000);
      var expect = {"cozy-labs/hello":{"displayName":"Hello","version":"1.0.0","url":"http://localhost:19104/apps/hello/"}};
      supertest( app )
        .get('/list-apps')
        .expect(JSON.stringify(expect))
        .expect(200, done);
    });
    it('plugins', function (done) {
      this.timeout(10000);
      var expect = {"fixtures/test-plugin/":{"displayName":"Test","version":"1.1.13","template":""}};
      supertest( app )
        .get('/list-plugins')
        .expect(JSON.stringify(expect))
        .expect(200, done);
    });
  });

  describe('uninstall', function () {
    it('should uninstall app', function (done) {
      this.timeout(10000);
      supertest( app )
        .post('/uninstall-app')
        .send({app:'cozy-labs/hello'})
        .expect(200, done);
    });
    it('should uninstall plugin', function (done) {
      this.timeout(10000);
      var test = pathExtra.join('fixtures/', 'test-plugin/');
      supertest( app )
        .post('/uninstall-plugin')
        .send({plugin:test})
        .expect(200, done);
    });
  });
});

