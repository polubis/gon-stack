export type ConsentCategoryId =
  'essential' | 'analytics' | 'personalization' | 'marketing';

export type ConsentPreferences = Record<ConsentCategoryId, boolean>;

export type ConsentRecord = {
  version: number;
  preferences: ConsentPreferences;
  updatedAt: string;
};

export type CookiesView = 'banner' | 'preferences';
