import { createMockRealtime } from '../integration/realtime';
import { createRepository } from '../integration/repository';
import { createFacade } from './facade';
import { createRegistry } from './registry';
import { createStore } from './store';

export const createMediator = () => {
  const store = createStore();
  const dependencies = {
    repository: createRepository(),
    realtime: createMockRealtime(),
  };
  const { trigger, register } = createRegistry(store, dependencies);
  const facade = createFacade(store, trigger);

  return { facade, register };
};
