import { act, renderHook } from '@testing-library/react';
import { atom, map, computed } from '../supa-store.js';

describe('Atom store utility', () => {
  it('works when created, holding the given initial value', () => {
    const $count = atom(0);

    expect($count.get()).toBe(0);
  });

  it('works when set, updating the stored value', () => {
    const $count = atom(0);

    $count.set(5);

    expect($count.get()).toBe(5);
  });

  it('works when reset, restoring the initial value after changes', () => {
    const $count = atom(0);

    $count.set(5);
    $count.reset();

    expect($count.get()).toBe(0);
  });

  it('works when asked for its initial value, returning it regardless of later changes', () => {
    const $count = atom(0);

    $count.set(5);

    expect($count.getInitial()).toBe(0);
  });

  it('works when used in a component, reflecting updates to the value', () => {
    const $count = atom(0);
    const { result } = renderHook(() => $count.use());

    expect(result.current).toBe(0);

    act(() => {
      $count.set(5);
    });

    expect(result.current).toBe(5);
  });
});

describe('Map store utility', () => {
  type Profile = { name: string; age: number };
  const initial: Profile = { name: '', age: 0 };

  it('works when created, holding the given initial value', () => {
    const $profile = map({ ...initial });

    expect($profile.get()).toEqual(initial);
  });

  it('works when a single key is set, updating just that key', () => {
    const $profile = map({ ...initial });

    $profile.setKey('name', 'Ada');

    expect($profile.get()).toEqual({ name: 'Ada', age: 0 });
  });

  it('works when reset, restoring the initial value after changes', () => {
    const $profile = map({ ...initial });

    $profile.setKey('name', 'Ada');
    $profile.reset();

    expect($profile.get()).toEqual(initial);
  });

  it('works when asked for its initial value, returning it regardless of later changes', () => {
    const $profile = map({ ...initial });

    $profile.setKey('name', 'Ada');

    expect($profile.getInitial()).toEqual(initial);
  });

  it("works when a key is removed, clearing that key's value", () => {
    const $profile = map<Profile>({ name: 'Ada', age: 30 });

    $profile.removeKey('age');

    expect($profile.get().age).toBeUndefined();
  });

  it('works when used in a component, reflecting updates to the value', () => {
    const $profile = map({ ...initial });
    const { result } = renderHook(() => $profile.use());

    expect(result.current).toEqual(initial);

    act(() => {
      $profile.setKey('name', 'Ada');
    });

    expect(result.current).toEqual({ name: 'Ada', age: 0 });
  });
});

describe('Computed store utility', () => {
  it('works when derived from a single store, updating whenever the source changes', () => {
    const $count = atom(2);
    const $doubled = computed($count, (count) => count * 2);

    const { result } = renderHook(() => $doubled.use());

    expect(result.current).toBe(4);

    act(() => {
      $count.set(3);
    });

    expect(result.current).toBe(6);
  });

  it('works when derived from multiple stores, updating whenever any source changes', () => {
    const $first = atom('John');
    const $last = atom('Doe');
    const $fullName = computed(
      [$first, $last],
      (first, last) => `${first} ${last}`,
    );

    const { result } = renderHook(() => $fullName.use());

    expect(result.current).toBe('John Doe');

    act(() => {
      $last.set('Smith');
    });

    expect(result.current).toBe('John Smith');
  });
});
