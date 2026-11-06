import type { SelectDemoE2eId } from '@/demos/select/e2e-ids';

// Every module's `data-e2e` ids, unioned in one place.
export type E2eId = SelectDemoE2eId | 'tailwind-override';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    'data-e2e'?: E2eId;
  }
}
