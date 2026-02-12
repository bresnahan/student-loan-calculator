/**
 *
 * Student Loan Calculator
 *
 * Copyright (c) 2020-2026, The Institute of Student Loan Advisors
 *
 */
 
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: ['next', 'next/core-web-vitals', 'eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {},
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    afterAll: false,
    afterEach: false,
    beforeAll: false,
    browser: false,
    describe: false,
    beforeEach: false,
    it: false,
  },
}
