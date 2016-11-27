/*global exports:true, require:true*/
(function () {
    'use strict';

    const assert = require('assert');

    var acorn = require('acorn');
    var escodegen = require('escodegen');

    var estraverse = require('estraverse');
    var Syntax = estraverse.Syntax;
    var VisitorKeys = estraverse.VisitorKeys;

    Syntax;
    VisitorKeys;

    var mutator = {
        Program: function*(node) {
        },

        IfStatement: function*(node) {
            yield node.consequent;
        },

        VariableDeclarator: function*(node) {
        },

        VariableDeclaration: function*(node) {
        },

        Literal: function*(node) {
        },

        Identifier: function*(node) {

        },
    };

    function* iterate(node) {
        for (var key of VisitorKeys[node.type]) {
            if (!node[key])
                continue;

            var nodes = Array.isArray(node[key]) ? node[key] : [node[key]];
            for (var i in nodes) {
                yield {parent: node, key: key, i: i, node: nodes[i]};
                yield* iterate(nodes[i]);
            }
        }
    }

    function replace(value, mutation) {
        var parent = value.parent;
        var key = value.key;
        var i = value.i;
        var replaced = value.node;

        if (Array.isArray(parent[key])) {
            parent[key][i] = mutation;
        } else {
            parent[key] = mutation;
        }

        return replaced;
    }

    function mutate(ast, interesting, value) {
        assert(value.node.type in mutator,
               'Unimplemented type: ' + value.node.type);
        var iter = mutator[value.node.type](value.node);
        var result = null;

        for (var m = iter.next(); !m.done; m = iter.next()) {
            var mutation = m.value;
            var replacement = replace(value, mutation);

            var tmp = escodegen.generate(ast);

            if (!interesting(tmp, ast))
                replace(value, replacement);
            else
                result = tmp;
        }

        return result;
    }

    function run(source, interesting) {
        if (!interesting(source, ast))
            return;

        var result = null;
        var ast = acorn.parse(source);

        assert.equal(ast.type, Syntax.Program);
        var iter = iterate(ast);

        for (var cur = iter.next(); !cur.done; cur = iter.next()) {
            var tmp = mutate(ast, interesting, cur.value);
            if (tmp)
                result = tmp;
        }

        if (!result)
            result = escodegen.generate(ast);

        return result;
    }

    exports.run = run;
}());
