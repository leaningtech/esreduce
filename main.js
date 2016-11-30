var basename = require('path').basename;
var fs = require('fs');
var esreduce = require('../esreduce');

function run(source, interesting) {
    var options = {};

    var stats = {
        initialCode: {
            lines: source.split('\n').length,
            bytes: source.length,
        },
        finalCode: {
            lines: 0,
            bytes: 0,
        },
        tests: {
            total: 0,
            interesting: 0,
            uninteresting: 0,
        },
    };

    var result = esreduce.run(source, interesting, options, stats);

    if (result === undefined) {
        console.error('Initial source code is not considered interesting!');
        process.exit(1);
    }

    var outfile = '/tmp/esreduce.js';
    console.log('ESReduce final JS code written to:', outfile);
    fs.writeFileSync(outfile, result + '\n');

    console.log('ESReduce statistics:');
    console.log(`\t- initial lines: ${stats.initialCode.lines}`);
    console.log(`\t- initial bytes: ${stats.initialCode.bytes}`);
    console.log(`\t- final lines: ${stats.finalCode.lines}`);
    console.log(`\t- final bytes: ${stats.finalCode.bytes}`);
    console.log(`\t- total tests: ${stats.tests.total}`);
    console.log(`\t- interesting: ${stats.tests.interesting}`);
    console.log(`\t- uninteresting: ${stats.tests.uninteresting}`);
}

function help(status) {
    console.error('usage: ' + basename(process.argv[1]) +
                  ' configfile sourcefile');
    process.exit(status);
}

if (process.argv.length !== 4)
    help(1);

const configfile = process.argv[2];
const sourcefile = process.argv[3];

let config = require(configfile);
let interesting = config.interesting;

run(fs.readFileSync(sourcefile, 'utf8'), interesting);
