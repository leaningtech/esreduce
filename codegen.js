/*global exports:true, require:true*/
(function () {
    'use strict';
    var escodegen = require('escodegen');

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

    exports.generate = generate;
}());
