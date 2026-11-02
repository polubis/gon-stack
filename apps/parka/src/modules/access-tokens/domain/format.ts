import { instantDateTimeLabel } from '@/shared/date/date';

export const formatWhen = (iso: string): string => instantDateTimeLabel(iso);

/** `parka_mcp_Ab12…xy89`: enough to recognise a token, useless to use it. */
export const maskToken = (hint: string, tail: string): string =>
  `parka_mcp_${hint}…${tail}`;
