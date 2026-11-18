import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { context } from '@repo/react-kit/context';
import { isDay, periodContaining } from '@/shared/period/period';
import {
  readQueryParam,
  writeQueryParam,
  writeQueryParams,
} from '@/shared/router/navigation';
import {
  DATE_PARAM,
  FEATURE_NAME,
  KIND_PARAM,
  PERIOD_KINDS,
} from '../configuration/constraints';
import { createMediator } from '../core/mediator';
import {
  filtersFromParams,
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
  PeriodKind,
  Reel,
  ReelId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from '../domain/models';
import { resetKnowledgeReads } from '../integration/repository';
import { useToday } from './clock';

const kindFromUrl = (): PeriodKind => {
  const value = readQueryParam(KIND_PARAM);
  return PERIOD_KINDS.find((kind) => kind === value) ?? 'month';
};

const dateFromUrl = (today: string): string => {
  const value = readQueryParam(DATE_PARAM);
  return value !== null && isDay(value) ? value : today;
};

const filtersFromUrl = (): KnowledgeFilters =>
  filtersFromParams(new URLSearchParams(window.location.search));

const nextPosition = (items: readonly { position: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.position + 1), 0);

/**
 * The module store plus the viewed period (`kind` and `anchor`, mirrored in
 * the `view` / `date` params), the filters (mirrored in the query params) and
 * writers that build new items with placeholder ids.
 */
export const [Provider, useContext] = context(FEATURE_NAME, () => {
  const [{ facade, register }] = useState(createMediator);
  const today = useToday();
  const [kind, setKindState] = useState(kindFromUrl);
  const [anchor, setAnchorState] = useState(() => dateFromUrl(today));
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

  // Back / Forward may land on another period or filters.
  useEffect(() => {
    const onPop = () => {
      setKindState(kindFromUrl());
      setAnchorState(dateFromUrl(today));
      setFiltersState(filtersFromUrl());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [today]);

  const period = periodContaining(kind, anchor);
  const summary = useMemo(() => summaryOf(allTopics), [allTopics]);

  return {
    today,
    kind,
    anchor,
    period,
    /** Moves to a period; another kind switches the view. */
    setPeriod: (next: { kind: PeriodKind; day: string }) => {
      setKindState(next.kind);
      setAnchorState(next.day);
      writeQueryParams({ [KIND_PARAM]: next.kind, [DATE_PARAM]: next.day });
    },
    setAnchor: (day: string) => {
      setAnchorState(day);
      writeQueryParam(DATE_PARAM, day);
    },
    filters,
    setFilters: (next: KnowledgeFilters) => {
      setFiltersState(next);
      writeQueryParams(filtersToParams(next));
    },
    categories,
    catalogs,
    tags,
    allTopics,
    summary,
    topics: facade.useRanged(),
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
