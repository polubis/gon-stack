import { useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { useDataChanges } from '@/shared/data-sync/presentation/use-data-changes';
import { resetDashboardReads } from '../integration/repository';
import { createMediator } from '../core/mediator';
import { FEATURE_NAME } from '../configuration/constraints';

export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);

  useLayoutEffect(() => {
    const unsub = register();
    return () => {
      unsub();
      // Leaving the view drops what it read: the next visit starts clean.
      resetDashboardReads();
    };
  }, [register]);

  // MCP changed the data: reload quietly.
  useDataChanges('finance', facade.refresh);

  return facade;
});
