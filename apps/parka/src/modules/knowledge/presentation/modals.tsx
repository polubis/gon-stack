import { useEffect } from 'react';
import {
  closeModal,
  closeModalThen,
  useModalStack,
} from '@/shared/router/modal-stack';
import { BacklogDialog } from './backlog-dialog';
import { CatalogDialog } from './catalog-dialog';
import { CategoryDialog } from './category-dialog';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import { FiltersDrawer } from './filters-drawer';
import { ListDialog } from './list-dialog';
import {
  BACKLOG_MODAL,
  FILTERS_MODAL,
  LIST_MODAL,
  NEW_BACKLOG_TOPIC_MODAL,
  editModal,
  newModal,
  newTopicCatalogOf,
  parseEntityModal,
  reelMediaOf,
  reelsTopicOf,
  resetProgressTopicOf,
  viewedTopicOf,
} from './modal-ids';
import { ReelViewer } from './reel-viewer';
import { ReelsDialog } from './reels-dialog';
import { TagDialog } from './tag-dialog';
import { TopicDialog } from './topic-dialog';

/** Renders the popups that are open in the URL stack, in their order. */
export const Modals = ({ defaultDay }: { defaultDay: string }) => {
  const {
    categories,
    catalogs,
    tags,
    allTopics,
    reels,
    initializing,
    deleteCategory,
    deleteCatalog,
    deleteTag,
    deleteTopic,
    deleteReel,
    removeReelMedia,
    resetTopicProgress,
  } = useContext();
  const stack = useModalStack();

  const known = (entity: string, id: string): boolean =>
    entity === 'category'
      ? categories.some((c) => c.id === id)
      : entity === 'catalog'
        ? catalogs.some((c) => c.id === id)
        : entity === 'tag'
          ? tags.some((t) => t.id === id)
          : entity === 'topic'
            ? allTopics.some((t) => t.id === id)
            : Object.values(reels).some((list) =>
                list.some((r) => r.id === id),
              );

  // A deep link to something that is gone must not leave a dead `modal=` param.
  useEffect(() => {
    if (initializing) return;
    for (const modal of stack) {
      const parsed = parseEntityModal(modal);
      const topicId =
        reelsTopicOf(modal) ??
        viewedTopicOf(modal) ??
        resetProgressTopicOf(modal);
      if (
        (parsed?.id && !known(parsed.entity, parsed.id)) ||
        (topicId && !allTopics.some((t) => t.id === topicId))
      )
        closeModal(modal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing, stack, categories, catalogs, tags, allTopics, reels]);

  // Nothing to edit before the data is here.
  if (initializing) return null;

  const dialog = (modal: string) => {
    if (modal === FILTERS_MODAL)
      return <FiltersDrawer key={modal} modal={modal} />;
    if (modal === BACKLOG_MODAL)
      return <BacklogDialog key={modal} modal={modal} />;
    if (modal === NEW_BACKLOG_TOPIC_MODAL)
      return <TopicDialog key={modal} modal={modal} defaultDay={null} />;
    for (const entity of ['category', 'catalog', 'tag'] as const)
      if (modal === LIST_MODAL[entity])
        return <ListDialog key={modal} modal={modal} entity={entity} />;
    if (modal === newModal('category'))
      return <CategoryDialog key={modal} modal={modal} />;
    if (modal === newModal('catalog'))
      return <CatalogDialog key={modal} modal={modal} />;
    if (modal === newModal('tag'))
      return <TagDialog key={modal} modal={modal} />;
    if (modal === newModal('topic'))
      return <TopicDialog key={modal} modal={modal} defaultDay={defaultDay} />;
    const catalogId = newTopicCatalogOf(modal);
    if (catalogId)
      return (
        <TopicDialog
          key={modal}
          modal={modal}
          catalogId={catalogId}
          defaultDay={defaultDay}
        />
      );
    const reelsOf = reelsTopicOf(modal);
    const reelsTopic = allTopics.find((t) => t.id === reelsOf);
    if (reelsTopic)
      return <ReelsDialog key={modal} modal={modal} topic={reelsTopic} />;
    const viewed = allTopics.find((t) => t.id === viewedTopicOf(modal));
    if (viewed) return <ReelViewer key={modal} modal={modal} topic={viewed} />;

    const resetOf = allTopics.find((t) => t.id === resetProgressTopicOf(modal));
    if (resetOf)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          title="Zresetować postęp?"
          description={`Wszystkie rolki tematu „${resetOf.title}” znów będą nieukończone.`}
          confirmLabel="Resetuj"
          onConfirm={() => {
            resetTopicProgress(resetOf.id);
            closeModal(modal);
          }}
        />
      );

    const mediaOf = reelMediaOf(modal);
    if (mediaOf)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          title="Usunąć media rolki?"
          description="Obraz lub wideo zostanie usunięte z rolki, sam tekst zostaje."
          onConfirm={() => {
            removeReelMedia(mediaOf);
            closeModal(modal);
          }}
        />
      );

    const parsed = parseEntityModal(modal);
    if (!parsed?.id) return null;
    const { entity, action, id } = parsed;
    if (action === 'edit') {
      const category = categories.find((c) => c.id === id);
      if (entity === 'category' && category)
        return <CategoryDialog key={modal} modal={modal} category={category} />;
      const catalog = catalogs.find((c) => c.id === id);
      if (entity === 'catalog' && catalog)
        return <CatalogDialog key={modal} modal={modal} catalog={catalog} />;
      const tag = tags.find((t) => t.id === id);
      if (entity === 'tag' && tag)
        return <TagDialog key={modal} modal={modal} tag={tag} />;
      const topic = allTopics.find((t) => t.id === id);
      if (entity === 'topic' && topic)
        return (
          <TopicDialog
            key={modal}
            modal={modal}
            topic={topic}
            defaultDay={null}
          />
        );
      return null;
    }
    // Delete: confirmation, then the form it came from closes too.
    const subject =
      entity === 'category'
        ? categories.find((c) => c.id === id)?.name
        : entity === 'catalog'
          ? catalogs.find((c) => c.id === id)?.name
          : entity === 'tag'
            ? tags.find((t) => t.id === id)?.name
            : entity === 'topic'
              ? allTopics.find((t) => t.id === id)?.title
              : 'rolka';
    if (subject === undefined) return null;
    const confirm: Record<typeof entity, () => void> = {
      category: () => deleteCategory(id as never),
      catalog: () => deleteCatalog(id as never),
      tag: () => deleteTag(id as never),
      topic: () => deleteTopic(id as never),
      reel: () => deleteReel(id as never),
    };
    const copy: Record<typeof entity, [string, string]> = {
      category: [
        'Usunąć kategorię?',
        `Kategoria „${subject}” zostanie usunięta, jej katalogi zostaną bez kategorii.`,
      ],
      catalog: [
        'Usunąć katalog?',
        `Katalog „${subject}” zostanie usunięty razem ze wszystkimi tematami i rolkami.`,
      ],
      tag: [
        'Usunąć tag?',
        `Tag „${subject}” zostanie zdjęty ze wszystkich tematów.`,
      ],
      topic: [
        'Usunąć temat?',
        `Temat „${subject}” zostanie usunięty razem z rolkami i postępem.`,
      ],
      reel: [
        'Usunąć rolkę?',
        'Rolka zostanie usunięta bez możliwości cofnięcia.',
      ],
    };
    return (
      <DeleteDialog
        key={modal}
        modal={modal}
        title={copy[entity][0]}
        description={copy[entity][1]}
        onConfirm={() => {
          confirm[entity]();
          closeModalThen(modal, () => closeModal(editModal(entity, id)));
        }}
      />
    );
  };

  return <>{stack.map(dialog)}</>;
};
