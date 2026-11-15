import { createFacade } from './facade';
import { createRegistry } from './registry';
import { createStore } from './store';

export const createMediator = () => {
  const store = createStore();
  const { trigger, register } = createRegistry(store);
  const facade = createFacade(store, trigger);

  return { facade, register };
};
