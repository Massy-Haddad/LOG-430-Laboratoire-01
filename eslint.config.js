import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  ...js.configs.recommended,
  languageOptions: {
    ...js.configs.recommended.languageOptions,
    globals: {
      ...globals.node,
    }
  }
});
