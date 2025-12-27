import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
export default {
  input: './src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg.unpkg,
      format: 'iife',
      sourcemap: true,
      name: 'InfiniteScroll',
    },
  ],
  external: [...Object.keys(pkg.peerDependencies || {}), 'react/jsx-runtime'],
  plugins: [resolve(), typescript({ useTsconfigDeclarationDir: true })],
};
