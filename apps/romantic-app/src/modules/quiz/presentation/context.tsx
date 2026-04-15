import { useLayoutEffect, useState } from 'react';
import { createHookContext } from '@/libs/power-context';
import { FEATURE_NAME } from '../configuration/constraints';
import { createMediator } from '../core/mediator';

export const [Provider, useContext] = createHookContext(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);

  useLayoutEffect(() => {
    const unsub = register();
    return () => unsub();
  }, [register]);

  return facade;
});
