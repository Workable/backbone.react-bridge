import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'examples/src/index.js',
  output: {
    format: 'umd',
    file: 'examples/dist/examples.bundle.js'
  },
  watch: {
    include: ['src/**', 'examples/src/**']
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    commonjs(),
    serve({
      open: true,
      contentBase: ['examples'],
    }),
    livereload({watch: 'examples/dist'})
  ]
};
