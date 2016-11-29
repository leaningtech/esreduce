import {basename} from "path"
import {readFileSync as readFile, writeFileSync} from 'fs'
import * as esreduce from 'esreduce'

function run(source, interesting) {
    var result = esreduce.run(source, interesting);

    if (result === undefined) {
        console.error('Initial source code is not considered interesting!');
        process.exit(1);
    }

    var stats = esreduce.lastStats;
    console.log('ESReduce statistics:');
    console.log(`\t- iterations: ${stats.iterations}`);
    console.log(`\t- interesting tests: ${stats.interestingTests}`);

    var outfile = '/tmp/esreduce.js';
    console.log('ESReduce final JS code written to:', outfile);
    writeFileSync(outfile, result + '\n');
}

function help(status) {
    console.error('usage: ' + basename(process.argv[1]) +
                  ' configfile sourcefile');
    process.exit(status);
}

if (process.argv.length != 4)
    help(1);

const configfile = process.argv[2];
const sourcefile = process.argv[3];

let config = require(configfile);
let interesting = config.interesting;

run(readFile(sourcefile, 'utf8'), interesting);
