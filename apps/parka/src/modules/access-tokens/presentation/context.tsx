import { useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { createMediator } from '../core/mediator';
import { FEATURE_NAME } from '../configuration/constraints';

export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);

  useLayoutEffect(() => {
    const unsub = register();
    return () => unsub();
  }, [register]);

  return facade;
});
