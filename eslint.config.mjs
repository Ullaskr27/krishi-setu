import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'smart-crop-system/**/*'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
