import globals from 'globals';
import tsEslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwindcss from 'eslint-plugin-tailwindcss';
import next from '@next/eslint-plugin-next';
import security from 'eslint-plugin-security';

export default tsEslint.config(
  {
    ignores: [
      'node_modules/',
      '.next/',
      'public/',
      'prisma/seed.ts',
      'prisma/seed-products.ts',
      '**/*.config.mjs',
      'eslint.config.js',
    ],
  },
  {
    files: ['**/*.{js,cjs,ts,jsx,tsx}'],
  },
  {
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      jsdoc,
      unicorn,
      sonarjs,
      promise,
      react,
      'react-hooks': hooks,
      'jsx-a11y': jsxA11y,
      tailwindcss,
      '@next/next': next,
      security,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsEslint.parser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      ...tsEslint.configs.stylistic.rules,
      ...jsdoc.configs['recommended-typescript-error'].rules,
      ...unicorn.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      ...promise.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...tailwindcss.configs.recommended.rules,
      'tailwindcss/no-custom-classname': 'off',
      ...next.configs.recommended.rules,
      ...security.configs.recommended.rules,
      ...prettier.rules,

      // JSDoc
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': 'off',

      // Unicorn
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-ternary': ['error', 'only-single-line'],

      // SonarJS
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/deprecation': 'off',

      // Typescript
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
