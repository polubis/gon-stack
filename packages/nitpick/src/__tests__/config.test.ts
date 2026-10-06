import { describe, expect, it } from 'vitest';
import { config, resolveRules } from '../config.js';

describe('Config helper works when', () => {
  it('returns the given config untouched', () => {
    const value = { rules: [] };
    expect(config(value)).toBe(value);
  });

  it('resolves rules given as a list', () => {
    const rules = [{ id: 'x', instruction: () => 'y' }];
    expect(resolveRules(config({ rules }))).toBe(rules);
  });

  it('resolves rules given as a function with an identity rule helper', () => {
    const rule = { id: 'x', instruction: () => 'y' };
    const resolved = resolveRules(
      config({ rules: ({ rule: define }) => [define(rule)] }),
    );
    expect(resolved).toHaveLength(1);
    expect(resolved[0]).toBe(rule);
  });

  it('resolves an empty function result to no rules', () => {
    expect(resolveRules(config({ rules: () => [] }))).toEqual([]);
  });
});
