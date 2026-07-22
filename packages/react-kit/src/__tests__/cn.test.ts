import { cn } from '../cn.js';

describe('Class name merge utility', () => {
  it('works when given plain strings, joining them with a space', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('works when given no classes, returning an empty string', () => {
    expect(cn()).toBe('');
  });

  it('works when given falsy values, ignoring them', () => {
    expect(cn('foo', false, undefined, null, '', 'bar')).toBe('foo bar');
  });

  it('works when given an object of conditional classes, including only the truthy keys', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('works when given nested arrays of classes, flattening them into a single string', () => {
    expect(cn('foo', ['bar', ['baz']])).toBe('foo bar baz');
  });

  it('works when given conflicting Tailwind utility classes, keeping only the last one', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
