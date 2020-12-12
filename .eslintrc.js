module.exports = {
  extends: '@josselinbuils/eslint-config-react',
  ignorePatterns: ['dist'],
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'prefer-promise-reject-errors': 'off', // buggy
  },
};
