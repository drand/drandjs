const assert = require('assert');
const helpers = require('../src/helpers.js');

describe('Message Concatenation', function() {
    it('should give correct length of 32bytes',function() {
        return helpers.message('deadbeef',42).then((msg) => {
            assert.equal(32,msg.length);
        });
    });
});
