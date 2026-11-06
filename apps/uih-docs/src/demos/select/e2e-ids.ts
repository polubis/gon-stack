type SelectDemo =
  | 'basic'
  | 'search'
  | 'owner'
  | 'live'
  | 'sound'
  | 'modal'
  | 'dark'
  | 'disabled'
  | 'headless';

export type SelectDemoE2eId =
  | `select-demo:${SelectDemo}`
  | 'select-demo:stream-count'
  | 'select-demo:stream-log'
  | 'select-demo:live-add'
  | 'select-demo:live-remove'
  | 'select-demo:sound-toggle';
