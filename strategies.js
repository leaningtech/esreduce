/*global exports:true, require:true*/
(function () {
    'use strict';

    const assert = require('assert');

    var estraverse = require('estraverse');
    var Syntax = estraverse.Syntax;

    var log = require('debug')('mutate');
    var codegen = require('./codegen.js');

    var traversal = require('./traversal.js');
    var iterate = traversal.iterate;
    var simpleWalk = traversal.simpleWalk;

    // --- List of possible mutations -----------------------------------------

    function createEmptyBlockStatement() {
        return {
            type: Syntax.BlockStatement,
            body: [],
        };
    }

    function createEmptyArrayExpression() {
        return {
            type: Syntax.ArrayExpression,
            elements: [],
        };
    }

    // TODO remove the generators
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
            yield null;
            if (node.consequent) {
                yield node.consequent;
            }
            if (node.alternate) {
                yield node.alternate;
            }
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
            yield null;
            //yield node.body;
        },

        DoWhileStatement: function*(node) {
            yield null;
            //yield node.body;
        },

        ForStatement: function*(node) {
            yield null;
            //yield node.body;
        },

        ForInStatement: function*(node) {
            yield null;
            //yield node.body;
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

    // --- Utility functions --------------------------------------------------

    function replace(container, key, value) {
        var replaced = container[key];
        container[key] = value;
        return replaced;
    }

    function tryMutation(ast, interesting, value) {
        assert(value.node.type in mutator,
               'Unimplemented type: ' + value.node.type);
        var iter = mutator[value.node.type](value.node);
        var changed = false;

        for (var m = iter.next(); !m.done; m = iter.next()) {
            var mutation = m.value;
            var replacement = replace(value.container, value.key, mutation);

            if (log.enabled) {
                var r = replacement === null ? null : replacement.type;
                var m = mutation === null ? null : mutation.type;
                log('replace:', r, 'with:', m);
            }

            var tmp = codegen.generate(ast);

            if (tmp === null || !interesting(tmp, ast)) {
                replace(value.container, value.key, replacement);
            } else {
                changed = true;

                log('successful mutation!');
                // After a successful mutation, there is no reason to try the
                // other less important mutations on the same AST node.
                break;
            }
        }

        return changed;
    }

    // --- Reduction strategies -----------------------------------------------

    // Remove BlockStatements by replacing the node with an empty
    // BlockStatement.
    function removeBlocks(ast, interesting) {
        var changed = false;

        simpleWalk(ast, function(node, depth, container, key) {
            // Do not replace empty block statements with a new empty block
            // statement. That will cause a reduction loop.
            if (node.type !== Syntax.BlockStatement || !node.body.length) {
                return;
            }

            var empty = createEmptyBlockStatement();
            var replacement = replace(container, key, empty);

            var tmp = codegen.generate(ast);

            if (tmp === null || !interesting(tmp, ast)) {
                replace(container, key, replacement);
                return false;
            } else {
                log('removed:', node.type);
                changed = true;
                return true;
            }
        });

        return changed;
    }

    // Remove function calls and callees by replacing them with 'null'.
    function removeFunctions(ast, interesting) {
        var changed = false;
        return changed;
    }

    // Traverse the AST and try each mutation.
    function mutate(ast, interesting) {
        var changed = false;

        var iter = iterate(ast);
        for (var cur = iter.next(); !cur.done; cur = iter.next()) {
            changed |= tryMutation(ast, interesting, cur.value);
        }

        return changed;
    }


    // --- Module exports -----------------------------------------------------

    exports.removeBlocks = removeBlocks;
    exports.removeFunctions = removeFunctions;
    exports.mutate = mutate;
}());
