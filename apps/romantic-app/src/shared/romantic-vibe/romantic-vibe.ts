import { romanticVibeRawEntrySchema } from './schemas';
import type { RomanticVibeEntry } from './domain';
import { createRomanticVibeEntryId } from './romantic-vibe-entry-id';
import type { RomanticVibeEntryFactory } from './models';

export class RomanticVibe {
  constructor(private readonly factory: RomanticVibeEntryFactory) {}

  getDomainModel = async (): Promise<RomanticVibeEntry> => {
    const raw = await this.factory();
    const parsed = romanticVibeRawEntrySchema.parse(raw);

    return {
      id: createRomanticVibeEntryId(parsed.key),
      key: parsed.key,
      content: parsed.content,
      category: parsed.category,
    };
  };
}
