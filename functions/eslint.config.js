// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Uses TypeScript parser
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',                  // Basic ESLint recommended rules
    'plugin:@typescript-eslint/recommended' // TypeScript plugin recommended rules
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-expressions': 'off', // disables deploy-breaking error
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
  },
};
