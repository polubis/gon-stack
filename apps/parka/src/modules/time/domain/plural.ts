const RULES = new Intl.PluralRules('pl');

const FORMS: Record<Intl.LDMLPluralRule, string> = {
  one: 'zadanie',
  few: 'zadania',
  many: 'zadań',
  other: 'zadania',
  zero: 'zadań',
  two: 'zadania',
};

/** `1 zadanie`, `2 zadania`, `5 zadań`, `22 zadania`. */
export const pluralTasks = (count: number): string =>
  `${count} ${FORMS[RULES.select(count)]}`;
