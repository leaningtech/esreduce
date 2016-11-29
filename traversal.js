/*global exports:true, require:true*/
(function () {
    'use strict';

    var estraverse = require('estraverse');
    var VisitorKeys = estraverse.VisitorKeys;

    var debug = require('debug')
    var log = debug('traversal')

    function* iterate(root) {
        var stack = [{
            parent: null,
            key: null,
            i: 0,
            node: root,
            depth: 0,
        }];

        var stackItem = 0;
        var current;
        while (current = stack[stackItem++]) {
            var parent = current.parent;
            var node = current.node;
            var depth = current.depth;

            if (log.enabled) {
                var indent = '';
                for (var d = 0; d < depth; d++)
                    indent += '--';

                log(indent + node.type);
            }

            yield current;

            // Check if the node is not removed before traversing its children.
            // TODO this test doesn't check if the parent of a node is removed.
            // It will only check if the direct parent includes the child node.
            if (parent) {
                var value = parent[current.key];
                if (!value)
                    continue;

                var children = Array.isArray(value) ? value : [value];
                if (!children[current.i])
                    continue;
            }

            // Traverse the node's children.
            for (var key of VisitorKeys[node.type]) {
                var value = node[key];
                var children = Array.isArray(value) ? value : [value];
                // forward: |for (var i = 0; i < children.length; i++) {|
                // Traverse the children backwards.
                for (var i = children.length - 1; i >= 0; i--) {
                    if (!children[i])
                        continue;

                    stack.push({
                        parent: node,
                        key: key,
                        i: i,
                        node: children[i],
                        depth: depth + 1,
                    });
                }
            }
        }
    }

    function simpleWalk(node, callback, depth) {
        if (node === null)
            return;

        if (depth === undefined)
            depth = 0;

        callback(node, depth);

        for (var key of VisitorKeys[node.type]) {
            var value = node[key];
            var children = Array.isArray(value) ? value : [value];
            for (var i = 0; i < children.length; i++) {
                if (!children[i])
                    continue;

                simpleWalk(children[i], callback, depth + 1);
            }
        }
    }

    exports.iterate = iterate;
    exports.simpleWalk = simpleWalk;
}());
