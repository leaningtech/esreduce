'use strict';

var fs = require('fs'),
    path = require('path'),
    root = path.join(path.dirname(fs.realpathSync(__filename)), '..'),
    esreduce = require(root);

module.exports = esreduce;
