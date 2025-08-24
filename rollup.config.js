import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
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
      globals: { 'react': 'React' },
    },
  ],
  external: [...Object.keys(pkg.peerDependencies || {})],
  plugins: [resolve(), typescript({ useTsconfigDeclarationDir: true })],
};
