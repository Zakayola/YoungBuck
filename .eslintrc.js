module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Downgrade any to warn — we have a few justified usages in error middleware
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unused vars prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Consistent type imports
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    // No floating promises
    '@typescript-eslint/no-floating-promises': 'error',
  },
  overrides: [
    // Next.js app
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: ['next/core-web-vitals'],
      rules: {
        // Next/Image is preferred but not required for this project yet
        '@next/next/no-img-element': 'warn',
      },
    },
    // Config / script files that use CommonJS
    {
      files: ['**/*.js', '**/*.config.js', '**/scripts/**/*.js'],
      env: { node: true, commonjs: true },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    // Test files
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.test.js'],
      env: { jest: true, node: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    'build',
    'coverage',
    'artifacts',
    'cache',
    'typechain-types',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2020: true,
  },
};
