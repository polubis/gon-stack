import { type Store } from './store';
import { init } from '@/modules/user-profile-setup/core/handlers/init';
import { saveAnswers } from './handlers/save-answers';
import { start } from './handlers/start';
import { prev } from './handlers/prev';
import { next } from './handlers/next';
import { editAnswers } from './handlers/edit-answers';
import { createBus } from './bus';

export const createRegistry = (store: Store) => {
  const bus = createBus();
 
  const register = bus.createRegistry(
    init(store, bus),
    start(store, bus),
    prev(store, bus),
    next(store, bus),
    saveAnswers(store, bus),
    editAnswers(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
