'use strict';

var program = require('commander');
var fs = require('fs-extra');
var pathExtra = require('path-extra');
var cozyLight = require('cozy-light');
var express = require('express');
var http = require('http');
var symbolsjs = require('symbolsjs');
var readlineToQuit = require('./readline_to_quit.js');
var application = require('./application.js');

var configHelpers = cozyLight.configHelpers;
var nodeHelpers = cozyLight.nodeHelpers;

var pkg = require( pathExtra.join(__dirname, '/package.json'));


// CLI

program
  .version(pkg.version);

program
  .command('start')
  .option('-H, --home <homedirectory>', 'Home directory of cozy-light host')
  .option('-h, --host <hostname>', 'hostname on which cozy-dashboard listens')
  .option('-p, --port <port>', 'port number on which cozy-dashboard listens')
  .description('start cozy-dashboard')
  .action(function(){

    var home = program.home || pathExtra.join(__dirname, '.test-working_dir');
    var port = parseInt(program.port) || 8080;
    var hostname = program.hostname || '127.0.0.1';

// set working directory
    if ( ! fs.existsSync(home)) {
      fs.mkdirSync(home);
    }
    configHelpers.init(home);

// emulate options
    var opts = {
      name: pkg.displayName,
      host: hostname,
      port: port,
      socketPort: (port + 1)
    };

    var app = express();

    application.connect(app,opts);
    app.use(express.static( pathExtra.join(__dirname, '/public') ) );

    var server = http.createServer(app);
    server.listen(opts.port);
    nodeHelpers.clearCloseServer(server);

    var wss = application.openWebsocket(opts);

    console.log('');
    console.log('\t   http://localhost:' + port + '/');
    console.log('\t   store location : ' + home);
    console.log('\t' + symbolsjs.ok + '  ' + pkg.displayName + ' started ');
    console.log('');

    cozyLight.nodeHelpers.clearCloseServer(server);

    readlineToQuit('\t   Press enter to leave...\n', function(){
      wss.close();
      server.close();
      console.log('\t   ..bye!');
      /*eslint-disable */
      process.exit(0);
      /*eslint-enable */
    });

  });





// Run CLI
program.parse(process.argv);


// If arguments doesn't match any of the one set, it displays help.
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
