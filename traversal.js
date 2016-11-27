/*global exports:true, require:true*/
(function () {
    'use strict';

    var estraverse = require('estraverse');
    var VisitorKeys = estraverse.VisitorKeys;

    var debug = require('debug')
    var log = debug('esreduce-traversal')

    function* iterate(node) {
        if (node === null)
            return;

        for (var key of VisitorKeys[node.type]) {
            if (!node[key])
                continue;

            var nodes = Array.isArray(node[key]) ? node[key] : [node[key]];
            for (var i in nodes) {
                var value = {parent: node, key: key, i: i, node: nodes[i]}
                log(value.node.type);
                yield value;
                yield* iterate(nodes[i]);
            }
        }
    }
    exports.iterate = iterate;
}());
