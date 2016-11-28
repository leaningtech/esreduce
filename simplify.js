/*global exports:true, require:true*/
(function () {
    'use strict';

    var estraverse = require('estraverse');
    var Syntax = estraverse.Syntax;

    var log = require('debug')('simplify')

    function removeNullNodes(node, children) {
        for (var c = 0; c < children.length; c++) {
            var child = children[c];

            if (child === null) {
                log('remove:', child, 'from:', node.type);
                children.splice(c, 1);
                c--;
                continue;
            }
        }
    }

    function mergeChildrenIntoParentsChildren(parent, parentProps, child, childProps, pos) {
        removeNullNodes(child, childProps);

        if (log.enabled) {
            var childTypes = [];

            for (var child of childProps) {
                childTypes.push(child.type);
            }

            log('merge:', childTypes, '\ninto:', parent, '\nat:', pos);
        }

        parentProps.splice(pos, 1, ...childProps);
    }

    function mergeBlockStatementChildrenIntoParent(node, children) {
        for (var c = 0; c < children.length; c++) {
            var child = children[c];
            if (child.type == Syntax.BlockStatement) {
                mergeChildrenIntoParentsChildren(node, children, child, child.body, c);
            }
        }
    }

    function simplify(ast, interesting) {
        var changed = false;

        estraverse.traverse(ast, {
            enter: function (node) {
                if (node.type == Syntax.Program) {
                    removeNullNodes(node, node.body);
                    mergeBlockStatementChildrenIntoParent(node, node.body);
                }
            }
        });

        return changed;
    }

    exports.simplify = simplify;
}());
