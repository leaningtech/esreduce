/*global exports:true, require:true*/
(function () {
    'use strict';

    const assert = require('assert');

    var acorn = require('acorn');
    var escodegen = require('escodegen');

    var estraverse = require('estraverse');
    var Syntax = estraverse.Syntax;

    var log = require('debug')('esreduce')
    var logVerbose = require('debug')('verbose')

    // TODO move mutate to another file
    var logMutate = require('debug')('mutate')

    var iterate = require('./traversal.js').iterate;
    var simplify = require('./simplify.js').simplify;

    function createEmptyBlockStatement() {
        return {
            type: "BlockStatement",
            body: [],
        };
    }

    function createEmptyArrayExpression() {
        return {
            type: "ArrayExpression",
            elements: [],
        };
    }

    var mutator = {
        Identifier: function*(node) {
        },

        Literal: function*(node) {
        },

        RegExpLiteral: function*(node) {
        },

        Program: function*(node) {
        },

        ExpressionStatement: function*(node) {
            yield null;
        },

        BlockStatement: function*(node) {
            if (node.body.length) {
                yield createEmptyBlockStatement();
            }
        },

        EmptyStatement: function*(node) {
            yield null;
        },

        DebuggerStatement: function*(node) {
        },

        WithStatement: function*(node) {
            yield null;
        },

        // Control flow

        ReturnStatement: function*(node) {
            yield null;
        },

        LabeledStatement: function*(node) {
            yield null;
        },

        BreakStatement: function*(node) {
            yield null;
        },

        ContinueStatement: function*(node) {
            yield null;
        },

        // Choice

        IfStatement: function*(node) {
            yield node.consequent;
            yield null;
        },

        SwitchStatement: function*(node) {
            yield null;
        },

        SwitchCase: function*(node) {
            yield null;
        },

        // Exceptions

        ThrowStatement: function*(node) {
        },

        TryStatement: function*(node) {
        },

        CatchClause: function*(node) {
        },

        // Loops

        WhileStatement: function*(node) {
            yield node.body;
            yield null;
        },

        DoWhileStatement: function*(node) {
            yield node.body;
            yield null;
        },

        ForStatement: function*(node) {
            yield node.body;
            yield null;
        },

        ForInStatement: function*(node) {
            yield node.body;
            yield null;
        },

        // Declarations

        FunctionDeclaration: function*(node) {
            yield null;
        },

        VariableDeclaration: function*(node) {
            yield null;
        },

        VariableDeclarator: function*(node) {
        },

        // Expressions

        ThisExpression: function*(node) {
        },

        ArrayExpression: function*(node) {
            if (node.elements && node.elements.length) {
                yield createEmptyArrayExpression();
            }
        },

        ObjectExpression: function*(node) {
            yield null;
        },

        Property: function*(node) {
            yield null;
        },

        FunctionExpression: function*(node) {
        },

        // Unary operations

        UnaryExpression: function*(node) {
        },

        UpdateExpression: function*(node) {
        },

        // Binary operations

        BinaryExpression: function*(node) {
        },

        AssignmentExpression: function*(node) {
        },

        LogicalExpression: function*(node) {
        },

        MemberExpression: function*(node) {
        },

        ConditionalExpression: function*(node) {
        },

        CallExpression: function*(node) {
            yield null;
        },

        NewExpression: function*(node) {
        },

        SequenceExpression: function*(node) {
        },
    };

    function replace(value, mutation) {
        var parent = value.parent;
        var key = value.key;
        var i = value.i;
        var replaced;

        if (Array.isArray(parent[key])) {
            replaced = parent[key][i];
            parent[key][i] = mutation;
        } else {
            replaced = parent[key];
            parent[key] = mutation;
        }

        if (logMutate.enabled) {
            var r = replaced === null ? null : replaced.type;
            var m = mutation === null ? null : mutation.type;
            logMutate('replaced:', r, 'with:', m);
        }

        return replaced;
    }

    function mutate(ast, interesting, value) {
        assert(value.node.type in mutator,
               'Unimplemented type: ' + value.node.type);
        var iter = mutator[value.node.type](value.node);
        var changed = false;

        for (var m = iter.next(); !m.done; m = iter.next()) {
            var mutation = m.value;
            var replacement = replace(value, mutation);

            var tmp = generate(ast);

            if (tmp === null || !interesting(tmp, ast))
                replace(value, replacement);
            else {
                log('mutation was successful!');
                changed = true;
            }
        }

        return changed;
    }

    var CodegenOptions = {
        format: {
            indent: {
                style: '\t',
            },
            semicolons: false,
        },
    };

    function generate(ast) {
        return escodegen.generate(ast, CodegenOptions);
    }

    function run(source, interesting) {
        // Verify that the original source code is interesting.
        if (!interesting(source, ast))
            return;

        // Convert original JS source code to an AST.
        var ast = acorn.parse(source);
        assert.equal(ast.type, Syntax.Program);

        var iterationLimit = 10;
        var iteration = 0;

        do {
            var changed = false;

            // Traverse the AST and try each mutation.
            var iter = iterate(ast);
            for (var cur = iter.next(); !cur.done; cur = iter.next()) {
                changed |= mutate(ast, interesting, cur.value);
            }

            // Simplify the AST by removing 'null' statements and by merging
            // BlockStatement's children into the parent node.
            changed |= simplify(ast);

            if (changed) {
                if (logVerbose.enabled) {
                    logVerbose('=== reduced the AST to: ===');
                    var iter = iterate(ast);
                    for (var cur = iter.next(); !cur.done; cur = iter.next());
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
        var result = generate(ast);

        return result;
    }

    exports.run = run;
    exports.iterate = iterate;
    exports.simplify = simplify;
}());
