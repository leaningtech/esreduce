'use strict';

var esreduce = require('./loader.js'),
    chai = require('chai'),
    expect = chai.expect;

describe('simplify', function () {
    it('can remove unrelated code and simplify', () => {
        var source = 'if (1) { var a=1; var b=3; var c = 3; a + b }'
        var expected = 'var a = 1;\nvar b = 3;\na + b';
        var actual = esreduce.run(source, (code, ast) => {
            try { return eval(code) == 4; }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });

    it('can create an empty function with a return value', () => {
        var source = 'function foo(a,b,c,d){' +
                     ';for(var i=b;i<c;i++){;a[i]=d};return a;};';
        var expected = 'function foo(a, b, c, d) {\n\treturn a\n}';
        var actual = esreduce.run(source, (code, ast) => {
            try {
                return eval(code + ';foo([],0,0,0)').length == 0 &&
                    code.indexOf('function foo') > -1;
            }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });

    it('can create an empty function without a return value', () => {
        var source = 'function foo(a,b,c,d){' +
                     ';for(var i=b;i<c;i++){;a[i]=d};return a;};';
        var expected = 'function foo(a, b, c, d) {\n}';
        var actual = esreduce.run(source, (code, ast) => {
            try {
                eval(code + ';foo([],0,0,0)');
                return code.indexOf('function foo') > -1;
            }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });

    it('can remove properties and the object completely', () => {
        var source = 'var a = [{b:1, c:2}]; a'
        var expected = 'var a = [];\na';
        var actual = esreduce.run(source, (code, ast) => {
            try { return eval(code).length !== undefined; }
            catch(e) { return false; }
        });
        expect(actual).to.be.equal(expected);
    });
});
