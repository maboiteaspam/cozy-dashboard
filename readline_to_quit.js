module.exports = function ( message, callback){
  message = message || '\tPress enter to leave...\n';

  var readline = require('readline');
  var rl = readline.createInterface(process.stdin, process.stdout);

  rl.question(message, function() {
    rl.close();
    if (callback != null) {
      callback();
    }
  });
};
