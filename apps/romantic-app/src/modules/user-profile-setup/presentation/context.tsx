import { useLayoutEffect, useState } from 'react';
import { createHookContext } from '../../../libs/power-context';
import { createMediator } from '../core/mediator';

export const [Provider, useContext] = createHookContext('UserProfile', () => {
  const [store, trigger, registry] = useState(createMediator)[0];
  const value = useState(() => ({ ...store, trigger }))[0];

  useLayoutEffect(() => {
    const unsub = registry();
    return () => unsub();
  }, [registry]);

  return value;
});
