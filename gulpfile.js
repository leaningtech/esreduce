'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var runSequence = require('run-sequence');

var TEST = [ 'test/*.js' ];

var LINT = [
    'gulpfile.js',
    'esreduce.js'
];

var ESLINT_OPTION = {
    'rules': {
        'quotes': 0,
        'eqeqeq': 0,
        'no-use-before-define': 0,
        'dot-notation': 0,
        'no-shadow': 0,
        'no-unused-vars': [
            2,
            {
                'vars': 'all',
                'args': 'none'
            }
        ],
        'no-multi-spaces': 0,
        'new-cap': [
            2,
            {
                'capIsNew': false
            }
        ]
    },
    'env': {
        'node': true,
    },
    'parserOptions': {
        'ecmaVersion': 6,
    },
};

gulp.task('test', function () {
    return gulp.src(TEST)
        .pipe(mocha({
            reporter: 'spec',
            timeout: 100000 // 100s
        }));
});

gulp.task('lint', function () {
    return gulp.src(LINT)
        .pipe(eslint(ESLINT_OPTION))
        .pipe(eslint.formatEach('stylish', process.stderr))
        .pipe(eslint.failOnError());
});

gulp.task('default', function (cb) {
    runSequence('test', 'lint', cb);
});
