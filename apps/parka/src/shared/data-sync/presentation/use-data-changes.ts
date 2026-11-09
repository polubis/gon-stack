import { useEffect, useEffectEvent } from 'react';
import type { DataDomain } from '@schemas/data-changes';
import { watchDataChanges } from '../integration/data-sync';

/** Runs `onChange` after MCP changed the `domain` data (see `watchDataChanges`). */
export const useDataChanges = (domain: DataDomain, onChange: () => void) => {
  const changed = useEffectEvent(onChange);
  useEffect(() => watchDataChanges(domain, changed), [domain]);
};
