import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { useDataChanges } from '@/shared/data-sync/presentation/use-data-changes';
import { writeQueryParams } from '@/shared/router/navigation';
import { FEATURE_NAME } from '../configuration/constraints';
import { createMediator } from '../core/mediator';
import {
  filtersFromParams,
  FILTER_PARAMS,
  filtersToParams,
  type KnowledgeFilters,
} from '../domain/filters';
import { newTempId } from '../domain/ids';
import { summaryOf } from '../domain/learning';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Reel,
  ReelId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from '../domain/models';
import { resetKnowledgeReads } from '../integration/repository';
import { useToday } from './clock';

const filtersFromUrl = (): KnowledgeFilters =>
  filtersFromParams(new URLSearchParams(window.location.search));

const nextPosition = (items: readonly { position: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.position + 1), 0);

/**
 * The module store plus the filters (mirrored in the query params, the
 * picked catalog among them) and writers that build new items with
 * placeholder ids.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const today = useToday();
  const [filters, setFiltersState] = useState(filtersFromUrl);
  const categories = facade.useCategories();
  const catalogs = facade.useCatalogs();
  const tags = facade.useTags();
  const allTopics = facade.useAllTopics();
  const reels = facade.useReels();

  useLayoutEffect(() => {
    const unsub = register();
    return () => {
      unsub();
      // Leaving the view drops what it read: the next visit starts clean.
      resetKnowledgeReads();
    };
  }, [register]);

  // MCP changed the data: reload quietly.
  useDataChanges('knowledge', facade.refresh);

  // Back / Forward may land on other filters or another catalog.
  useEffect(() => {
    const onPop = () => setFiltersState(filtersFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const summary = useMemo(() => summaryOf(allTopics), [allTopics]);
  // The picked catalog; a missing or unknown one falls back to the first.
  const catalog =
    catalogs.find((c) => c.id === filters.catalogId) ?? catalogs[0] ?? null;
  const listed = facade.useListed();
  const topics = useMemo(
    () => listed.filter((t) => t.catalogId === catalog?.id),
    [listed, catalog],
  );

  return {
    today,
    filters,
    /** Moves to another catalog; the lists stay loaded. */
    selectCatalog: (id: CatalogId) => {
      setFiltersState((current) => ({ ...current, catalogId: id }));
      writeQueryParams({ [FILTER_PARAMS.catalogId]: id });
    },
    setFilters: (next: KnowledgeFilters) => {
      setFiltersState(next);
      writeQueryParams(filtersToParams(next));
    },
    categories,
    catalogs,
    tags,
    allTopics,
    summary,
    catalog,
    topics,
    backlog: facade.useBacklog(),
    reels,
    mediaBusy: facade.useMediaBusy(),
    loaded: facade.useLoaded(),
    initializing: facade.useInitializing(),
    isLoading: facade.useIsLoading(),
    demoBusy: facade.useDemoBusy(),
    error: facade.useError(),
    notice: facade.useNotice(),
    load: facade.load,
    loadReels: facade.loadReels,
    setProgress: facade.setProgress,
    resetTopicProgress: facade.resetTopicProgress,
    loadDemo: facade.loadDemo,
    dismissNotice: facade.dismissNotice,
    notify: facade.notify,
    updateCategory: facade.updateCategory,
    deleteCategory: facade.deleteCategory,
    updateCatalog: facade.updateCatalog,
    deleteCatalog: facade.deleteCatalog,
    updateTag: facade.updateTag,
    deleteTag: facade.deleteTag,
    updateTopic: facade.updateTopic,
    deleteTopic: facade.deleteTopic,
    updateReel: facade.updateReel,
    deleteReel: facade.deleteReel,
    uploadReelMedia: facade.uploadReelMedia,
    removeReelMedia: facade.removeReelMedia,
    createCategory: (input: Pick<Category, 'name' | 'color'>) =>
      facade.createCategory({
        ...input,
        id: newTempId<CategoryId>(),
        position: nextPosition(categories),
      }),
    createCatalog: (
      input: Pick<Catalog, 'name' | 'description' | 'categoryId'>,
    ) =>
      facade.createCatalog({
        ...input,
        id: newTempId<CatalogId>(),
        position: nextPosition(catalogs),
      }),
    createTag: (input: Pick<Tag, 'name'>) =>
      facade.createTag({ ...input, id: newTempId<TagId>() }),
    createTopic: (
      input: Pick<
        Topic,
        'catalogId' | 'title' | 'description' | 'tagIds' | 'studyDay'
      >,
    ) =>
      facade.createTopic({
        ...input,
        id: newTempId<TopicId>(),
        position: nextPosition(allTopics),
        reelCount: 0,
        doneCount: 0,
        createdAt: new Date().toISOString(),
      }),
    createReel: (topicId: TopicId, body: string) =>
      facade.createReel({
        id: newTempId<ReelId>(),
        topicId,
        body,
        position: nextPosition(reels[topicId] ?? []),
        media: null,
        done: false,
      } satisfies Reel),
  };
});
