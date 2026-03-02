export type RomanticVibeEntryFactory = () => Promise<{
  key: string;
  content: string;
  category: string;
}>;
