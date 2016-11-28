/*global exports:true, require:true*/
(function () {
    'use strict';

    var child_process = require('child_process');
    var fs = require('fs');
    var execFileSync = child_process.execFileSync;

    // TODO use env var for JIT engine path.
    var engine = '/home/smvv/work/leaningtech/mozilla-central/js/src/obj-optimized/js/src/js'
    var args = [
        '--no-threads',
    ];

    var difference = 300; // minimum time difference between the jobs in ms.
    var timeout = 4000 // time after which a process is killed in ms.

    function spawn() {
        var startTime = process.hrtime();
        var status = 0;
        try {
            var output = execFileSync(...arguments);
        } catch (e) {
            status = 1;
        }
        var duration = process.hrtime(startTime);
        var ms = (duration[0] * 1000 + duration[1] / 1000000) | 0;
        return {
            duration: ms,
            output: output,
            status: status,
        };
    }

    function interesting(code, ast) {
        var options = {
            stdio: 'pipe',
            input: code,
            timeout: timeout,
        };

        var A = spawn(engine, args.concat(['--ion-pgo=on']), options);
        if (A.status !== 0)
            return false;

        var B = spawn(engine, args.concat(['--ion-pgo=off']), options);
        if (B.status !== 0)
            return false;

        console.log('A took:', A.duration, '(ms) B took:', B.duration, '(ms)',
                    'code length:', code.length,
                    'code lines:', code.split('\n').length);

        if (A.duration - B.duration < difference)
            return false;

        // Save the last interesting test case
        fs.writeFileSync('/tmp/runtime_sm_pgo.js', code);

        return true;
    }

    exports.interesting = interesting;
}());
