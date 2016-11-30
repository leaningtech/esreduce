/*global exports:true, require:true*/
(function () {
    'use strict';

    var estraverse = require('estraverse');
    var VisitorKeys = estraverse.VisitorKeys;

    var debug = require('debug')
    var log = debug('traversal')

    function* iterate(root) {
        var stack = [{
            container: null,
            key: null,
            node: root,
            depth: 0,
        }];

        var stackItem = 0;
        var current;
        while (current = stack[stackItem++]) {
            var container = current.container;
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
            if (container) {
                var value = container[current.key];
                if (!value)
                    continue;
            }

            // Traverse the node's properties.
            for (var nodeKey of VisitorKeys[node.type]) {
                var value = node[nodeKey];

                if (Array.isArray(value)) {
                    // Traverse the node properties backwards.
                    for (var i = value.length - 1; i >= 0; i--) {
                        if (!value[i])
                            continue;

                        stack.push({
                            container: value,
                            key: i,
                            node: value[i],
                            depth: depth + 1,
                        });
                    }
                } else if (value) {
                    stack.push({
                        container: node,
                        key: nodeKey,
                        node: value,
                        depth: depth + 1,
                    });
                }
            }
        }
    }

    function simpleWalk(node, callback, depth, container, key) {
        if (node === null)
            return;

        if (depth === undefined)
            depth = 0;

        var removed = callback(node, depth, container, key);

        if (removed)
            return;

        for (var nodeKey of VisitorKeys[node.type]) {
            var value = node[nodeKey];

            if (Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (!value[i])
                        continue;

                    simpleWalk(value[i], callback, depth + 1, value, i);
                }
            } else if (value) {
                simpleWalk(value, callback, depth + 1, node, nodeKey);
            }
        }
    }

    exports.iterate = iterate;
    exports.simpleWalk = simpleWalk;
}());
