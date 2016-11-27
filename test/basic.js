'use strict';

var esreduce = require('./loader.js'),
    chai = require('chai'),
    expect = chai.expect;

describe('basic', function () {
    it('initially uninteresting tests give undefined', () => {
        var actual = esreduce.run('var x = 42; // answer', () => false);
        expect(actual).to.be.equal(undefined);
    });

    it('can preserve simple code while removing comments', () => {
        var source = 'if (1)\n    var x = 42; // comment';
        var expected = 'if (1)\n    var x = 42';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf(expected) > -1;
        });
        expect(actual).to.be.equal(expected);
    });

    it('can remove an if statement while keeping the consequent', () => {
        var source = 'if (1) var x = 42; // comment';
        var expected = 'var x = 42';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf(expected) > -1;
        });
        expect(actual).to.be.equal(expected);
    });

    it('can remove an if statement and the consequent', () => {
        var source = 'if (0) {var a = 1;} var b = 2;';
        var expected = 'var b = 2';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf(expected) > -1;
        });
        expect(actual).to.be.equal(expected);
    });

    it('can remove unused functions', () => {
        var source = 'function a(){b();}; function b(){}; while (1) {\n}';
        var expected = 'while (1) {\n}';
        var actual = esreduce.run(source, (code, ast) => {
            return code.indexOf('while (1)') > -1;
        });
        expect(actual).to.be.equal(expected);
    });
});
