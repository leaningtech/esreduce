/*global exports:true, require:true*/
(function () {
    'use strict';

    //var estraverse = require('estraverse');
    //var esutils = require('esutils');
    var acorn = require('acorn');
    var escodegen = require('escodegen');

    function generate(source) {
        var ast = acorn.parse(source);

        return escodegen.generate(ast);
    }

    exports.generate = generate;
}());
