const assert = require('assert');
const helpers = require('../src/helpers.js');

describe('Message Concatenation', function() {
    it('should give correct length of 32 bytes',function() {
        return helpers.message('deadbeef',42).then((msg) => {
            assert.equal(32,msg.length);
        });
    });
});

describe("Verification of drand data", function() {
    const test = {
      Public: "8e7493212b3a6d64a4291a46f3f4560119e8a90902392400af1bb5ad1cc9fc67f6f4a1c5c845c4d4756e416241e15268",
      Signature: "b8d88bff95fe55de7c33ae03badc79d3101cd522b67adfed19d217fec1687e2833346f6a3b5552314c391383a372574a042339648f82be4648fa0528ee0fd3aac52cbdd6160f0b401804f079d8d36c498ec6f0e13305d603b168b59a4e0f084c",
      Message: "21ecd9aaf888f13c148d6cf91745ec2e6642fbe25994f042135d00b0abbb8c17",
      Round: 10
    }
    it("should return true with a correct message", function () {
        return helpers.verifyDrand(test.Message,test.Round, test.Signature, test.Public)
    }).timeout(10000);
    it("should return false with a random message", function() {
        return helpers.verifyDrand("deadbeef",test.Round, test.Signature, test.Public)
    }).timeout(10000);
});
