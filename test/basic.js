'use strict';

var esreduce = require('./loader.js'),
    chai = require('chai'),
    expect = chai.expect;

describe('basic', function () {
    it('initially uninteresting tests give undefined', function() {
        var actual = esreduce.run('var x = 42; // answer', () => false);
        expect(actual).to.be.equal(undefined);
    });

    it('can minimize simple code', function() {
        var source = 'if (1) var x = 42; // comment';
        var expected = 'var x = 42;';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf(expected) > -1;
        });
        expect(actual).to.be.equal(expected);
    });

    it('can preserve simple code while removing comments', function() {
        var source = 'if (1)\n    var x = 42; // comment';
        var expected = 'if (1)\n    var x = 42;';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf(expected) > -1;
        });
        expect(actual).to.be.equal(expected);
    });
});
