'use strict';

var esreduce = require('./loader.js');

var chai = require('chai'),
    expect = chai.expect;


describe('basic', function () {
    it('can parse code', function() {
        var actual = esreduce.generate('var x = 42; // answer');
        var expected = 'var x = 42;';
        expect(actual).to.be.equal(expected);
    });
});
