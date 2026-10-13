export const FEATURE_NAME = 'Notifications';

export const PAGE_SIZE = 20;

/** Start loading the next page this far before the end of the list. */
export const LOAD_AHEAD_MARGIN = '600px 0px';

export const ERROR_CODES = {
  load: 'NOTIFICATIONS_LOAD',
  loadMore: 'NOTIFICATIONS_LOAD_MORE',
  render: 'NOTIFICATIONS_RENDER',
} as const;
