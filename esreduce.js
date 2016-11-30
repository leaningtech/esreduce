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

    function logStatus(ast) {
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
    }

    function instrumentStats(interesting, stats) {
        if (stats)
            assert(stats.tests);

        return function(code, ast) {
            if (stats)
                stats.tests.total++;

            var result = interesting(code, ast);

            if (result) {
                if (stats)
                    stats.tests.interesting++;
                log('found an interesting test case!',
                    'bytes:', code.length, 'lines:', code.split('\n').length);
            } else {
                if (stats)
                    stats.tests.uninteresting++;
            }

            return result;
        };
    }

    function run(source, interesting, options, stats) {
        interesting = instrumentStats(interesting, stats);

        log('verifying that the source code is interesting');
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
                logStatus(ast);

                if (++iteration > iterationLimit) {
                    throw new Error('iteration limit (' + iterationLimit +
                                    ') is reached');
                } else if (log.enabled) {
                    log('=== start another iteration ===');
                }
            }
        } while (changed);

        // Generate the final JS code for the AST.
        var result = codegen.generate(ast);

        if (stats) {
            stats.finalCode.lines = result.split('\n').length;
            stats.finalCode.bytes = result.length;
        }

        return result;
    }

    exports.run = run;
    exports.traversal = traversal;
    exports.simplify = simplify;
}());
