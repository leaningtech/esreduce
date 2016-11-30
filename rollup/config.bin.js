import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'main.js',
    dest: 'bin/esreduce',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
    external: [ 'fs', 'path', 'esreduce' ],
    paths: {
        esreduce: '../esreduce.js'
    },
    plugins: [
        nodeResolve({
        }),
        buble()
    ]
}
