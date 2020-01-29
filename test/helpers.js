const assert = require('assert');
const helpers = require('../src/helpers.js');

describe('Message Concatenation', function() {
    it('should give correct length of 32 bytes',function() {
        const msg = helpers.message('deadbeef',42);
        assert.equal(32,msg.length);
    });
});

describe("Verification of drand data", function() {
    const fs = require('fs');
    let rawdata = fs.readFileSync('./test/test.json');
    let test = JSON.parse(rawdata);
    console.log(test);
    it("should return true with a correct message", async function () {
         const correct = await helpers.verify(test.API.previous,test.API.round, test.API.signature, test.Public)
         assert.equal(true,correct);
    }).timeout(10000);
    it("should return false with a random message", async function() {
        const correct = await helpers.verify("deadbeef",test.API.round, test.API.signature, test.Public)
        assert.equal(false,correct);
    }).timeout(10000);
});
