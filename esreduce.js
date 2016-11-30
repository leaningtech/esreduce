/*global exports:true, require:true*/
(function () {
    'use strict';

    const assert = require('assert');

    var acorn = require('acorn');

    var estraverse = require('estraverse');
    var Syntax = estraverse.Syntax;

    var log = require('debug')('esreduce');
    var logAst = require('debug')('ast');

    var traversal = require('./traversal.js');
    var simpleWalk = traversal.simpleWalk;

    var strategies = require('./strategies.js');

    var simplify = require('./simplify.js').simplify;

    var codegen = require('./codegen.js');

    function run(source, interesting) {
        // Verify that the original source code is interesting.
        if (!interesting(source, null))
            return;

        // Convert original JS source code to an AST.
        var ast = acorn.parse(source);
        assert.equal(ast.type, Syntax.Program);

        var iterationLimit = 10;
        var iteration = 0;

        do {
            var changed = false;

            changed |= strategies.removeBlocks(ast, interesting);

            changed |= strategies.removeFunctions(ast, interesting);

            changed |= strategies.mutate(ast, interesting);

            // Simplify the AST by removing 'null' statements and by merging
            // BlockStatement's children into the parent node.
            changed |= simplify(ast);

            if (changed) {
                if (logAst.enabled) {
                    logAst('=== reduced AST to: ===');

                    simpleWalk(ast, function(node, depth) {
                        var indent = '';
                        for (var i = 0; i < depth; i++) {
                            indent += '--';
                        }
                        logAst(indent + node.type);
                    });
                }

                if (++iteration > iterationLimit) {
                    var msg = 'iteration limit (' + iterationLimit + ') is reached';
                    throw new Error(msg);
                } else if (log.enabled) {
                    log('=== start another iteration ===');
                }
            }
        } while (changed);

        // Generate the final JS code for the AST.
        var result = codegen.generate(ast);

        return result;
    }

    exports.run = run;
    exports.traversal = traversal;
    exports.simplify = simplify;
}());
