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
        var source = 'if (1)\n\tvar x = 42; // comment';
        var expected = 'if (1)\n\tvar x = 42';
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

    it('can remove all code', () => {
        var source = 'var a=null;var b=[null];var c={d:b,o:0};'
        var expected = '';
        var actual = esreduce.run(source, () => true);
        expect(actual).to.be.equal(expected);
    });

    it('can remove unused object properties', () => {
        var source = 'var a = {b: 2, c: 3, d: 4}; a.b'
        var expected = 'var a = {\n\tb: 2\n};\na.b';
        var actual = esreduce.run(source, (source, ast) => {
            try { return eval(source) == 2; }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });

    it('can remove if statement and keep the alternate', () => {
        var source = 'if (0) var a = 1; else var a = 2; a'
        var expected = 'var a = 2;\na';
        var actual = esreduce.run(source, (source, ast) => {
            try { return eval(source) == 2; }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });
});
