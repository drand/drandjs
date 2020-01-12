const helpers = require('./helpers.js');
/**
* fetchAndVerify fetches needed information to check the randomness at a given round and verifies it
* @param identity
* @param distkey
* @param round
* @return Promise with struct {round previous signature randomness} both on completion and error
**/
var fetchAndVerify = function(identity, distkey, round) {
  var previous = 0; var signature = 0; var randomness = 0; var err = 0;
  if (distkey === helpers.defaultDistKey) {
    //fetch the distkey as well
    return new Promise(function(resolve, reject) {
      helpers.fetchKey(identity).then(key => {
        distkey = key.key;
        if (round == helpers.latestRound) {
          //use latest randomness
          helpers.fetchLatest(identity).then(rand => {
            previous = rand.previous;
            signature = rand.signature;
            randomness = rand.randomness;
            round = rand.round.toString();
            if (helpers.verifyDrand(previous, round, signature, distkey)) {
              resolve({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
            } else {
              reject({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
            }
          }).catch(error => console.error('Could not fetch randomness:', error));
        } else {
          //fetch given round
          helpers.fetchRound(identity, round).then(rand => {
            previous = rand.previous;
            signature = rand.signature;
            randomness = rand.randomness;
            if (helpers.verifyDrand(previous, round, signature, distkey)) {
              resolve({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
            } else {
              reject({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
            }
          }).catch(error => {
            console.log(error);
            if (error.name === 'SyntaxError') {
              console.error('Could not fetch the round:', round);
            } else {
              console.error('Could not fetch randomness:', error);
            }
          });
        }
      }).catch(error => console.error('Could not fetch the distkey:', error));
    });

  } else {
    //we use given distkey
    return new Promise(function(resolve, reject) {
      if (round == helpers.latestRound) {
        //use latest randomness
        fetchLatest(identity).then(rand => {
          previous = rand.previous;
          signature = rand.signature;
          randomness = rand.randomness;
          round = rand.round.toString();
          if (helpers.verifyDrand(previous, round, signature, distkey)) {
            resolve({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
          } else {
            reject({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
          }
        }).catch(error => console.error('Could not fetch randomness:', error));
      } else {
        //fetch given round
        helpers.fetchRound(identity, round).then(rand => {
          previous = rand.previous;
          signature = rand.signature;
          randomness = rand.randomness;
          if (helpers.verifyDrand(previous, round, signature, distkey)) {
            resolve({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
          } else {
            reject({"round":round, "previous":previous, "signature":signature, "randomness": randomness});
          }
        }).catch(error => {
          console.log(error);
          if (error.name === 'SyntaxError') {
            console.error('Could not fetch the round:', round);
          } else {
            console.error('Could not fetch randomness:', error);
          }
        });
      }
    });
  }
}

module.exports.fetchAndVerify = fetchAndVerify;
module.exports.defaultDistKey = helpers.defaultDistKey;
module.exports.latestRound = helpers.latestRound;
module.exports.sha256 = helpers.sha256;
module.exports.message = helpers.message;
module.exports.fetchGroup = helpers.fetchGroup;
module.exports.fetchKey = helpers.fetchKey;
module.exports.fetchRound = helpers.fetchRound;
module.exports.fetchLatest = helpers.fetchLatest;
