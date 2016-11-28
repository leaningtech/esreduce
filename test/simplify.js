'use strict';

var esreduce = require('./loader.js'),
    chai = require('chai'),
    expect = chai.expect;

describe('simplify', function () {
    it('can remove unrelated code and simplify', () => {
        var source = 'if (1) { var a=1; var b=3; var c = 3; a + b }'
        var expected = 'var a = 1;\nvar b = 3;\na + b';
        var actual = esreduce.run(source, (source, ast) => {
            try { return eval(source) == 4; }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });
});
