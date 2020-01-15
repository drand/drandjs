// length of the message to pass to verification routine
const LENGTH_MSG = 32; 
const DRAND_DOMAIN = new Uint8Array([1,9,6,9,9,6,9,2])
const bls = require('@nikkolasg/noble-bls12-381');
const crypto = require("crypto");

let sha256 = (message) => {
    const hash = crypto.createHash("sha256");
    hash.update(message);
    return Uint8Array.from(hash.digest());
};


const unknownKey = "";
const unknownRound = -1;

// https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
function safeFetch(path) {
    return fetch(path).then(resp =>  {
      if (resp.ok) {
        return resp.json()
      } else {
        return Promise.reject(`fetch error to ${fullPath}: resp.ok false: ${resp}`)
      }
  });
}

// fetchLatest fetches the latest randomness from the node described by identity
function fetchLatest(identity) {
  var fullPath = identity.Address + "/api/public";
  if (identity.TLS == false) {
    fullPath = "http://" + fullPath;
  } else  {
    fullPath = "https://" + fullPath;
  }
  return safeFetch(fullPath);
}

module.exports.fetchLatest = fetchLatest;

// fetchRound fetches the randomness at given round
function fetchRound(identity, round) {
  var fullPath = identity.Address + "/api/public/" + round;
  if (identity.TLS == false) {
    fullPath = "http://" + fullPath;
  } else  {
    fullPath = "https://" + fullPath;
  }
  return safeFetch(fullPath);
}

module.exports.fetchRound = fetchRound;

// fetchKey fetches the public key
function fetchKey(identity) {
  var fullPath = identity.Address + "/api/info/distkey";
  if (identity.TLS == false) {
    fullPath = "http://" + fullPath;
  } else  {
    fullPath = "https://" + fullPath;
  }
  return safeFetch(fullPath);
}

module.exports.fetchKey = fetchKey;

// fetchGroup fetches the group file
function fetchGroup(identity) {
  var fullPath = identity.Address + "/api/info/group";
  if (identity.TLS == false) {
    fullPath = "http://" + fullPath;
  } else  {
    fullPath = "https://" + fullPath;
  }
  return safeFetch(fullPath);
}

module.exports.fetchGroup = fetchGroup;

// hexToBytes converts hex string to bytes array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// int64ToBytes converts int to bytes array
function int64ToBytes(int) {
    var bytes = [];
    var i = 8;
    do {
    bytes[--i] = int & (255);
    int = int>>8;
    } while ( i )
    return bytes;
}

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}
// message returns the message to verify / signed by drand nodes given the round
// number and the previous hashed randomness.
function message(prev, round) {
    const bprev = hexToBytes(prev);
    const bround = int64ToBytes(round);
    const message = new Uint8Array(bprev.length + bround.length);
    message.set(bround);
    message.set(bprev, bround.length);
    return sha256(message)
}

// verifyDrand returns a Promise that returns true if the signature is correct
// and false otherwise. It formats previous and round into the signed message,
// verifies the signature against the distributed key and checks that the
// randomness hash matches
async function verify(previous, round, signature, distkey) {
    const msg = message(previous, round);
    // bls.verify return a promise that always resolve.
    return bls.verify(msg, distkey, signature, DRAND_DOMAIN)
}


function sha512(str) {
  return crypto.subtle.digest("SHA-512", str).then(buf => {
    return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
  });
}

module.exports.sha256 = sha256;
module.exports.toHexString = toHexString;
module.exports.message = message;
module.exports.verify = verify;
module.exports.unknownKey = unknownKey;
module.exports.unknownRound = unknownRound;
