import { createRepository } from '../integration/repository';
import { createFacade } from './facade';
import { createRegistry } from './registry';
import { createStore } from './store';

export const createMediator = () => {
  const store = createStore();
  const repository = createRepository();
  const { trigger, register } = createRegistry(store, repository);
  const facade = createFacade(store, trigger);

  return { facade, register };
};
