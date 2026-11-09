import { dayLabel } from '@/shared/date/date';
import type { TaskHistoryEntry } from './models';

const SNIPPET = 60;

const quote = (value: string | null): string => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return `„${text.length > SNIPPET ? `${text.slice(0, SNIPPET)}…` : text}”`;
};

const day = (value: string | null): string =>
  value ? dayLabel(value, 'short', true) : 'backlog';

const change = (what: string, entry: TaskHistoryEntry): string =>
  `${what}: ${quote(entry.from)} → ${quote(entry.to)}`;

const updated = (entry: TaskHistoryEntry): string => {
  switch (entry.field) {
    case 'title':
      return change('Zmieniono tytuł', entry);
    case 'description':
      return entry.from === null
        ? `Dodano opis: ${quote(entry.to)}`
        : entry.to === null
          ? 'Usunięto opis'
          : 'Zmieniono opis';
    case 'category':
      return `Zmieniono kategorię: ${entry.from} → ${entry.to}`;
    case 'priority':
      return `Zmieniono priorytet: ${entry.from} → ${entry.to}`;
    case 'day':
      return entry.to === null
        ? 'Przeniesiono do backlogu'
        : entry.from === null
          ? `Zaplanowano na ${day(entry.to)}`
          : `Zmieniono dzień: ${day(entry.from)} → ${day(entry.to)}`;
    case 'at':
      return entry.to === null
        ? 'Usunięto godzinę'
        : entry.from === null
          ? `Ustawiono godzinę ${entry.to}`
          : `Zmieniono godzinę: ${entry.from} → ${entry.to}`;
    case 'done':
      return entry.to === 'true'
        ? 'Oznaczono jako zrobione'
        : 'Cofnięto oznaczenie „zrobione”';
    case 'in_progress':
      return entry.to === 'true' ? 'Rozpoczęto zadanie' : 'Wstrzymano zadanie';
    case 'status':
      return `Zmieniono status: ${entry.from ?? '—'} → ${entry.to ?? '—'}`;
    case null:
      return 'Zmieniono zadanie';
  }
};

/** One line, in Polish, saying what happened. */
export const describeHistory = (entry: TaskHistoryEntry): string => {
  switch (entry.kind) {
    case 'created':
      return `Utworzono zadanie ${quote(entry.to)}`;
    case 'updated':
      return updated(entry);
    case 'attachment_added':
      return `Dodano załącznik ${quote(entry.to)}`;
    case 'attachment_removed':
      return `Usunięto załącznik ${quote(entry.from)}`;
    case 'comment_added':
      return `Dodano komentarz: ${quote(entry.to)}`;
    case 'comment_edited':
      return change('Zmieniono komentarz', entry);
    case 'comment_removed':
      return `Usunięto komentarz: ${quote(entry.from)}`;
  }
};
