import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

export default {
  input: 'src/app.js',
  output: {
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default',
    file: 'main.js'
  },
  external: ['obsidian'],
  plugins: [
    nodeResolve({browser: true}),
    commonjs(),
    webWorkerLoader({
      targetPlatform: 'browser',
      preserveSource: true,
      sourcemap: true,
    })
  ],
  context: 'window'
};
