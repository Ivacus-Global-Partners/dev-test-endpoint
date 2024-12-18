import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import tsdocPlugin from 'eslint-plugin-tsdoc'

// eslint-disable-next-line tsdoc/syntax
/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { tsdoc: tsdocPlugin },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
]
