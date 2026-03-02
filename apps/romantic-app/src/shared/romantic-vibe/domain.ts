import type { RomanticVibeEntryId } from './romantic-vibe-entry-id';
import type { RomanticVibeCategory } from './schemas';

export type RomanticVibeEntry = {
  id: RomanticVibeEntryId;
  key: string;
  content: string;
  category: RomanticVibeCategory;
};
