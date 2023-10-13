// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

export default {
  input: 'index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript({sourceMap: true, inlineSources: true}),
    serve({
      port: 8080,
    })
  ]
};
