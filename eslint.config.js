'use strict';

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('airbnb-base'),
  ...compat.env({ browser: true, commonjs: true, es2021: true }),
  {
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        afterEach: 'readonly',
        browser: 'writable',
        dataLayer: 'writable',
      },
    },
    rules: {
      'import/no-extraneous-dependencies': 0,
      'import/no-dynamic-require': 0,
      'import/newline-after-import': 0,
      'no-prototype-builtins': 0,
      'no-plusplus': 0,
      'global-require': 0,
      strict: 0,
      'consistent-return': 0,
      'no-underscore-dangle': 0,
      'no-await-in-loop': 0,
      'no-multi-spaces': 1,
      'no-param-reassign': 0,
      'no-use-before-define': 'off',
      'prefer-destructuring': [1, { array: false, object: true }, { enforceForRenamedProperties: false }],
      'comma-dangle': ['error', {
        arrays: 'never',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'ignore',
      }],
      'no-confusing-arrow': ['warn', { allowParens: true }],
    },
  },
];
