import { useLayoutEffect, useState } from 'react';
import { createHookContext } from '@/libs/power-context';
import { createMediator } from '../core/mediator';
import { FEATURE_NAME } from '../configuration/constraints';

export const [Provider, useContext] = createHookContext(
  FEATURE_NAME,
  ({ mediatorFactory } = { mediatorFactory: createMediator }) => {
    const [{ facade, register }] = useState(mediatorFactory);

    useLayoutEffect(() => {
      const unsub = register();
      return () => unsub();
    }, [register]);

    return facade;
  },
);
