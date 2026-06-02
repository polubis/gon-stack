import { createRegistry } from './registry';
import { createStore } from './store';

export const createMediator = () => {
  const store = createStore();
  const { trigger, registry } = createRegistry(store);

  return [store, trigger, registry] as const;
};
