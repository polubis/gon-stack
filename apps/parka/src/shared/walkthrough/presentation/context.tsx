import { useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { createMediator } from '../core/mediator';
import { FEATURE_NAME } from '../configuration/constraints';

export const [Provider, useContext] = context(
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
