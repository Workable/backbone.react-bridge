import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

const env = process.env.NODE_ENV;

const config = {
  input: 'src/index.js',
  external: ['backbone.marionette', 'react', 'react-dom', 'underscore'],
  output: {
    format: 'umd',
    name: 'backbone.react-bridge',
    globals: {
      'backbone.marionette': 'Marionette',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'underscore': '_'
    }
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    commonjs()
  ]
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

export default config;
