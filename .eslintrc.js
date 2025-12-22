const path = require('path');
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    node: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  settings: {
    react: {
      version: '17.0',
    },
  },
  rules: {
    '@typescript-eslint/prefer-regexp-exec': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/unbound-method': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    'react/no-deprecated': 'warn',
  },
};
