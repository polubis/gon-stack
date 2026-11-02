import { instantDateTimeLabel } from '@/shared/date/date';

/** `sob. 24 paź 2026, 10:00`: when a comment was written. */
export const formatCommentTime = (iso: string): string =>
  instantDateTimeLabel(iso);
