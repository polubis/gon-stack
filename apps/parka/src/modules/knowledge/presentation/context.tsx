import { useLayoutEffect, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { FEATURE_NAME } from '../configuration/constraints';
import { createMediator } from '../core/mediator';
import type { BrainAreaId } from '../domain/brain-area';

/**
 * The module store plus what only the screen cares about: the search phrase,
 * the brain area picked as a filter and the area a folder points at right now.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<BrainAreaId | null>(null);
  const [hovered, setHovered] = useState<BrainAreaId | null>(null);

  useLayoutEffect(() => register(), [register]);

  return {
    query,
    setQuery,
    /** Area chosen on the brain: only its folders are listed. */
    area,
    toggleArea: (next: BrainAreaId) =>
      setArea((current) => (current === next ? null : next)),
    clearArea: () => setArea(null),
    /** Area to light up on the brain: hovered folder, else the chosen one. */
    hovered,
    setHovered,
    nodes: facade.useNodes(),
    folders: facade.useFolders(),
    categories: facade.useCategories(),
    priorities: facade.usePriorities(),
    initializing: facade.useInitializing(),
    isLoading: facade.useIsLoading(),
    error: facade.useError(),
    notice: facade.useNotice(),
    load: facade.load,
    createNode: facade.createNode,
    updateNode: facade.updateNode,
    deleteNode: facade.deleteNode,
    createFolder: facade.createFolder,
    dismissNotice: facade.dismissNotice,
  };
});
