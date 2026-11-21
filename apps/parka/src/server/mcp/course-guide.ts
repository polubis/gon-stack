import guide from './course-authoring-guide.md?raw';

const NOTES: Record<string, string> = {
  pl: 'Write in Polish. Address the reader as "Ty" (informal, second person singular). Use all Polish characters (ą ć ę ł ń ó ś ź ż), never ASCII substitutes.',
  en: 'Write in English. Use the casual "you".',
  de: 'Write in German. Use the informal "du", never "Sie".',
};

const GENERIC_NOTE =
  'Write in the language the user asked for. Imitate the tone of the voice reference. Do not translate jokes literally: replace them with ones that work in that language.';

const primaryLanguage = (tag: string) =>
  tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';

/** Guide in Markdown plus the short note for one BCP-47 language. */
export const buildCourseGuide = (language: string, subject?: string) => {
  const note = NOTES[primaryLanguage(language)] ?? GENERIC_NOTE;
  const topic = subject ? `\n\nSubject of this course: ${subject}\n` : '';
  return `${guide}\n### ${language}\n\n${note}${topic}`;
};
