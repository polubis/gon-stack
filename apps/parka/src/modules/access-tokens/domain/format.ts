const WHEN = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatWhen = (iso: string): string => WHEN.format(new Date(iso));

/** `parka_mcp_Ab12…xy89`: enough to recognise a token, useless to use it. */
export const maskToken = (hint: string, tail: string): string =>
  `parka_mcp_${hint}…${tail}`;
