import { z } from 'zod';
import { VERSION_URL } from '../configuration/constraints';

const versionFile = z.object({ version: z.string().min(1) });

/** Version of the newest deploy, or `null` when it cannot be read right now. */
export const fetchLatestVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    const parsed = versionFile.safeParse(await response.json());
    return parsed.success ? parsed.data.version : null;
  } catch {
    return null;
  }
};
