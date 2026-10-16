import { actions, forward, forwardPatch, patches } from '../actions.js';
import { store } from '../store.js';
import { value } from '../value.js';

describe('value actions', () => {
  it('runs a sync action', () => {
    const count$ = value(1);
    const { add } = actions(count$, {
      add: (current, by: number) => current + by,
    });

    add(2);

    expect(count$.get()).toBe(3);
  });

  it('runs an async action and resolves after set', async () => {
    const count$ = value(1);
    const { addLater } = actions(count$, {
      addLater: async (current, by: number) => current + by,
    });

    await addLater(2);

    expect(count$.get()).toBe(3);
  });
});

describe('store actions', () => {
  it('patches only returned keys', () => {
    const s = store({ count: 1, name: 'a' });
    const { rename } = patches(s, {
      rename: (_, name: string) => ({ name }),
    });

    rename('b');

    expect(s.get()).toEqual({ count: 1, name: 'b' });
  });

  it('runs an async patch', async () => {
    const s = store({ count: 1, name: 'a' });
    const { bump } = patches(s, {
      bump: async (current) => ({ count: current.count + 1 }),
    });

    await bump();

    expect(s.get()).toEqual({ count: 2, name: 'a' });
  });
});

describe('forward', () => {
  it('copies changes to the target', () => {
    const source$ = value(1);
    const target$ = value(0);

    forward(source$, target$);
    source$.set(2);

    expect(target$.get()).toBe(2);
  });

  it('maps changes and can be stopped', () => {
    const source$ = value(1);
    const target$ = value('');

    const stop = forward(source$, target$, (n) => `n${n}`);
    source$.set(2);
    stop();
    source$.set(3);

    expect(target$.get()).toBe('n2');
  });

  it('patches a store from a value', () => {
    const source$ = value(1);
    const s = store({ count: 0, name: 'a' });

    forwardPatch(source$, s, (count) => ({ count }));
    source$.set(4);

    expect(s.get()).toEqual({ count: 4, name: 'a' });
  });
});
