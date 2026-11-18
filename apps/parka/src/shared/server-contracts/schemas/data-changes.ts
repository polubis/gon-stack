import { z } from 'zod';

/** Parts of the app an MCP write can change. */
export const DATA_DOMAINS = ['time', 'finance', 'knowledge'] as const;

export type DataDomain = (typeof DATA_DOMAINS)[number];

/** One change notice, streamed to the browser. */
export const dataChangeSchema = z.object({
  domain: z.enum(DATA_DOMAINS),
});
