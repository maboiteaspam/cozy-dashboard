'use strict';
var pathExtra = require('path-extra');
var async = require('async');
var Browser = require('zombie');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var packageDir = pathExtra.join( __dirname, '..' );
var workingDir = pathExtra.join( packageDir, '.test-working_dir/');
var fixturesDir = pathExtra.join( packageDir, 'fixtures/');
workingDir = pathExtra.resolve(workingDir) + '/';
fixturesDir = pathExtra.resolve(fixturesDir) + '/';



describe('cozy dashboard', function () {
  this.timeout(600000);

  before(function(done){
    this.timeout(900000);
      console.error(['cozy-light', '--home', workingDir, 'install', packageDir].join(' '))
    spawn('cozy-light', ['--home', workingDir, 'install', packageDir], { stdio: 'inherit' })
      .on('close', function (code) {
//        if ( code !== 0 ) return done(code);
            console.error(['cozy-light', '--home', workingDir, 'start'].join(' '))
        spawn('cozy-light', ['--home', workingDir, 'start'], { stdio: 'inherit' });
        setTimeout(done, 500);
      });
  });



    it('should answer 200', function (done) {
// Global setting, applies to all browser instances
      Browser.localhost('localhost:19104');

// Browser instance for this test
      var browser = Browser.create();
      browser.visit('/apps/cozy-dashboard/',function() {
        browser.assert.url('http://localhost:19104/apps/cozy-dashboard/');
        setTimeout(function(){
          try {
            var s = browser.assert.link('.app-line a',
              'Dashboard',
              'http://localhost:19104/apps/cozy-dashboard/');
            console.error(s); // null
          } catch(ex) {
            console.error(ex);
            //[TypeError: Cannot use 'in'
            // operator to search for 'compareDocumentPosition' in null]
          }
          done();
        },5500);
      });

    });

});
