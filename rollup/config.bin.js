import buble from 'rollup-plugin-buble'

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
    buble()
  ]
}
