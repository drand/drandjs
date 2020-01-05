// length of the message to pass to verification routine
const LENGTH_MSG = 32; 
const DRAND_DOMAIN = new Uint8Array([1,9,6,9,9,6,9,1])
const bls = require('@nikkolasg/noble-bls12-381');

const defaultDistKey = "";
const latestRound = -1;

// fetchLatest fetches the latest randomness from the node described by identity
function fetchLatest(identity) {
  var fullPath = identity.Address + "/api/public";
  if (identity.TLS == false) {
    fullPath = "http://" + fullPath;
  } else  {
    fullPath = "https://" + fullPath;
  }
  return fetch(fullPath).then(resp => Promise.resolve(resp.json()));
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
  return fetch(fullPath).then(resp => Promise.resolve(resp.json()));
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
  return fetch(fullPath).then(resp => Promise.resolve(resp.json()));
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
  return fetch(fullPath).then(resp => Promise.resolve(resp.json()));
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

// message returns the message to verify / signed by drand nodes given the round
// number and the previous hashed randomness.
async function message(prev, round) {
    const bprev = hexToBytes(prev);
    const bround = int64ToBytes(round);
    const message = new Uint8Array(bprev.length + bround.length);
    message.set(bround);
    message.set(bprev, bround.length);
    return sha256(message);
}

// verifyDrand returns a Promise that returns true if the signature is correct
// and false otherwise. It formats previous and round into the signed message,
// verifies the signature against the distributed key and checks that the
// randomness hash matches
async function verifyDrand(previous, round, signature, distkey) {
    return message(previous, round)
        .then(msg => bls.verify(msg, distkey, signature, DRAND_DOMAIN));
}

// sha256 function used to hash input to bls verify / sign
let sha256;
if (typeof window == "object" && "crypto" in window) {
    sha256 = async (message) => {
        const buffer = await window.crypto.subtle.digest("SHA-256", message.buffer);
        return new Uint8Array(buffer);
    };
}
else if (typeof process === "object" && ("node" in process.versions || process.browser)) {
    const { createHash } = require("crypto");
    sha256 = async (message) => {
        const hash = createHash("sha256");
        hash.update(message);
        return Uint8Array.from(hash.digest());
    };
}
else {
    console.log("hello hello");
    throw new Error("The environment doesn't have sha256 function");
}


function sha512(str) {
  return crypto.subtle.digest("SHA-512", str).then(buf => {
    return Array.prototype.map.call(new Uint8Array(buf), x=>(('00'+x.toString(16)).slice(-2))).join('');
  });
}

module.exports.message = message;
module.exports.verifyDrand = verifyDrand;
module.exports.defaultDistKey = defaultDistKey;
module.exports.latestRound = latestRound;
