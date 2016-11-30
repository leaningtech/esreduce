var basename = require('path').basename;
var fs = require('fs');
var esreduce = require('../esreduce');

function run(source, interesting) {
    var result = esreduce.run(source, interesting);

    if (result === undefined) {
        console.error('Initial source code is not considered interesting!');
        process.exit(1);
    }

    var outfile = '/tmp/esreduce.js';
    console.log('ESReduce final JS code written to:', outfile);
    fs.writeFileSync(outfile, result + '\n');

    var stats = esreduce.lastStats;
    console.log('ESReduce statistics:');
    console.log(`\t- iterations: ${stats.iterations}`);
    console.log(`\t- interesting tests: ${stats.interestingTests}`);
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
