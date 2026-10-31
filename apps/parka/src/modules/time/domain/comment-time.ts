const WHEN = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** `24 paź 2026, 10:00`: when a comment was written. */
export const formatCommentTime = (iso: string): string =>
  WHEN.format(new Date(iso));
