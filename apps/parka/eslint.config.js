import { config } from '@repo/eslint-config/react-internal';
import { config as conventions } from '@repo/eslint-config/conventions';
import { exhaustive } from '@repo/eslint-config/exhaustive';
import { config as supabase } from '@repo/eslint-config/supabase';
import { config as testing } from '@repo/eslint-config/testing';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  // Ignore generated/third-party type files (regenerated frequently).
  {
    ignores: [
      '.astro/**',
      '.wrangler/**',
      'worker-configuration.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  // Repo rules: tests (unit + e2e via typed `getByE2e` selectors, see
  // decisions/20260914-000000-none-parka-migrate-e2e-ids-per-module.md),
  // source conventions, Supabase error mapping, type-aware exhaustiveness.
  ...testing,
  // Legacy debt: these tests still walk the DOM tree (closest, parentElement,
  // children, document.activeElement). The rule stays on for every other test;
  // migrate a file to role queries / toHaveFocus and delete it from this list.
  {
    files: [
      'src/modules/dashboard/__tests__/dashboard-flow.test.tsx',
      'src/modules/dashboard/__tests__/expense-detail.test.tsx',
      'src/modules/dashboard/__tests__/period-control.test.tsx',
      'src/modules/expenses-management/__tests__/expenses-management.test.tsx',
      'src/modules/expenses-management/__tests__/manage-suggestions.test.tsx',
      'src/modules/settings/__tests__/device-recognition.test.tsx',
      'src/modules/time/__tests__/device-recurring.test.tsx',
      'src/modules/time/__tests__/task-attachments.test.tsx',
      'src/modules/time/__tests__/task-forms.test.tsx',
      'src/modules/time/__tests__/task-key.test.tsx',
      'src/modules/time/__tests__/time-flow.test.tsx',
      'src/shared/navigation/overlay-nav/__tests__/overlay-nav.test.tsx',
      'src/shared/ui/__tests__/toast.test.tsx',
    ],
    rules: { 'testing-library/no-node-access': 'off' },
  },
  ...conventions,
  // Legacy a11y debt: custom menus, dialogs and media that jsx-a11y flags and
  // that were never audited. Rules stay on for every other file; fix a file,
  // then delete it from the list.
  {
    files: ['src/shared/form-memory/presentation/typeahead.tsx'],
    rules: { 'jsx-a11y/click-events-have-key-events': 'off' },
  },
  {
    files: [
      'src/modules/dashboard/presentation/add-menu.tsx',
      'src/modules/dashboard/presentation/expense-menu.tsx',
      'src/modules/time/presentation/add-menu.tsx',
      'src/modules/time/presentation/task-menu.tsx',
      'src/shared/ui/controls.tsx',
    ],
    rules: { 'jsx-a11y/interactive-supports-focus': 'off' },
  },
  {
    files: [
      'src/modules/time/presentation/attachment-viewer.tsx',
      'src/modules/time/presentation/video-trim-dialog.tsx',
    ],
    rules: { 'jsx-a11y/media-has-caption': 'off' },
  },
  {
    files: [
      'src/modules/dashboard/presentation/period-range-dialog.tsx',
      'src/shared/expense-form/presentation/product-dialog.tsx',
    ],
    rules: { 'jsx-a11y/no-autofocus': 'off' },
  },
  {
    files: [
      'src/modules/dashboard/presentation/period-range-dialog.tsx',
      'src/shared/period-control/presentation/period-control.tsx',
    ],
    rules: { 'jsx-a11y/no-noninteractive-element-interactions': 'off' },
  },
  {
    files: [
      'src/modules/time/presentation/stats.tsx',
      'src/modules/time/presentation/task-history.tsx',
    ],
    rules: { 'jsx-a11y/no-noninteractive-tabindex': 'off' },
  },
  {
    files: ['src/shared/walkthrough/presentation/main.tsx'],
    rules: { 'jsx-a11y/no-static-element-interactions': 'off' },
  },
  ...supabase,
  ...exhaustive(import.meta.dirname),
];
