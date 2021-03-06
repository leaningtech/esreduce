'use strict';

var esreduce = require('./loader.js'),
    chai = require('chai'),
    expect = chai.expect;

var acorn = require('acorn');
var traversal = esreduce.traversal;

var Syntax = require('estraverse').Syntax;

describe('traversal', function () {
    it('visits nodes in breadth first, backwards order', function() {
        var source = 'var a=1; while(0) { var b=2 } var c=3; if (0) var d=4';
        var ast = acorn.parse(source);

        var actual = [];
        var expected = ['c', 'a', 'd', 'b'];

        var iter = traversal.iterate(ast);
        for (var cur = iter.next(); !cur.done; cur = iter.next()) {
            if (cur.value.node.type === Syntax.Identifier) {
                actual.push(cur.value.node.name);
            }
        }

        expect(actual).to.be.deep.equal(expected);
    });

    // TODO this test doesn't check if the parent of a node is removed. It will
    // only check if the direct parent includes the child node.
    it('do not visit removed nodes', function() {
        var source = 'var a=1; while(0) { var b=2 } var c=3; if (0) var d=4';
        var ast = acorn.parse(source);

        var iter = traversal.iterate(ast);

        var actual = [];
        var expected = ['c', 'a'];

        for (var cur = iter.next(); !cur.done; cur = iter.next()) {
            var node = cur.value.node;
            if (node.type === Syntax.Identifier) {
                actual.push(node.name);
            }

            // Remove while statement and if statement with their children
            if (node.type === Syntax.WhileStatement) {
                expect(ast.body[1].type).to.be.equal(Syntax.WhileStatement);
                ast.body[1] = null;
            } else if (node.type === Syntax.IfStatement) {
                expect(ast.body[3].type).to.be.equal(Syntax.IfStatement);
                ast.body[3] = null;
            }
        }

        expect(actual).to.be.deep.equal(expected);
    });

    // TODO add a test to verify that the simpleWalk traversal works
});
