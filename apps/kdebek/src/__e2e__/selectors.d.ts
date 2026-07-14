export type E2eId =
  | 'home:main'
  | 'home:nav-desktop'
  | 'home:nav-toggle'
  | 'home:nav-menu-mobile'
  | 'home:hero-heading';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    'data-e2e'?: E2eId;
  }
}
