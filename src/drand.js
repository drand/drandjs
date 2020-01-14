const h = require('./helpers.js');
const helpers = h;

class InvalidVerification extends Error {
    constructor(rand) {
      // Maintenir dans la pile une trace adéquate de l'endroit où l'erreur a été déclenchée (disponible seulement en V8)
      if(Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError);
      }
      this.name = 'InvalidVerification';
      // Informations de déboguage personnalisées
      this.rand = rand;
      this.date = new Date();
    }

    toString() {
        return `Invalid verification for response ${this.rand}`;
    }
}
/** 
 * * fetchAndVerify fetches needed information to check the randomness at a
 * given round and verifies the randomness. It returns a resolving promise in
 * case of a valid randomness and throws an error otherwise. 
 * The dist key can be ommited, it will be retrieved from the identity in that
 * case and returned in the response. The round can be ommitted, it will use the
 * latest round in that case and returned in the response.
* @param identity
* @param distkey
* @param round
* @return Promise with struct {round previous signature randomness} on valid
* signature
* @throws Error in case of invalid signature or network error
**/
async function fetchAndVerify(identity, distkey = h.unknownKey, round = h.unknownRound) {
    var rand = null;
    if (round == h.unknownRound) {
        // use latest randomness
        console.log("fetchAndVerify will fetch for latest round");
        rand = await h.fetchLatest(identity);
        round = rand.round;
    } else {
        //fetch given round
        console.log("fetchAndVerify will fetch for round ", round);
        rand = await h.fetchRound(identity, round);
    }
    rand.distkey = distkey;
    if (distkey == h.unknownKey) {
        const dk = await h.fetchKey(identity);
        rand.distkey = dk.key;
        console.log("fetchAndVerify: fetched distkey ",rand.distkey);
    } 
    console.log("fetchAndVerify: fetched and will now verify... ",rand);
    const correct = await helpers.verify(rand.previous, 
                round, rand.signature, rand.distkey);

    if (correct == true) {
        return rand;
    } else {
        throw new InvalidVerification(rand);
    }
}

module.exports.InvalidVerification = InvalidVerification;
module.exports.fetchAndVerify = fetchAndVerify;
module.exports.unknownKey = helpers.unknownKey;
module.exports.unknownRound = helpers.unknownRound;
module.exports.sha256 = helpers.sha256;
module.exports.toHexString = helpers.toHexString;
module.exports.message = helpers.message;
module.exports.fetchGroup = helpers.fetchGroup;
module.exports.fetchKey = helpers.fetchKey;
module.exports.fetchRound = helpers.fetchRound;
module.exports.fetchLatest = helpers.fetchLatest;
