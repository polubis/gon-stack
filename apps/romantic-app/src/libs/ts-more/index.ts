export type Prettify<TObject> = {
  [Key in keyof TObject]: TObject[Key];
} & {};

export type Brand<TData, TLabel extends string> = TData & { __brand: TLabel };

/**
 * Keeps autocomplete for known literals, while still allowing any string.
 *
 * Example:
 * type QuestionKey = Key<'user-profile.display-name' | 'user-profile.age'>;
 */
export type Key<TKnown extends string> = TKnown | (string & {});
