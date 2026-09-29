const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  'category.groceries': 'Spożywcze',
  'category.transport': 'Transport',
  'category.bills': 'Rachunki',
  'category.fun': 'Rozrywka',
  'category.health': 'Zdrowie',
  'category.other': 'Inne',
};

/** Default categories store a `category.<slug>` symbol; user-made ones a plain name. */
export const categoryLabel = (name: string): string =>
  DEFAULT_CATEGORY_LABELS[name] ?? name;
