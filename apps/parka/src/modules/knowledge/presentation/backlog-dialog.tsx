import { Inbox, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { activeFilterCount, describeFilters } from '../domain/filters';
import { useContext } from './context';
import { NEW_BACKLOG_TOPIC_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';
import { TopicList } from './topic-list';

/** Topics without a study day. Set a day in a topic to plan it. */
export const BacklogDialog = ({ modal }: { modal: string }) => {
  const { backlog, filters, categories, catalogs, tags } = useContext();
  const narrowed = activeFilterCount(filters) > 0;
  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:backlog-dialog"
      title="Backlog"
      description="Tematy bez dnia nauki."
    >
      <div className="mb-3 flex justify-end">
        <Button
          className="w-auto px-3 py-2"
          onClick={() => openModal(NEW_BACKLOG_TOPIC_MODAL)}
        >
          <Plus className="size-4" aria-hidden="true" /> Dodaj
        </Button>
      </div>
      {backlog.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={narrowed ? 'Brak wyników' : 'Backlog jest pusty'}
          description={
            narrowed
              ? `Brak wyników dla ${describeFilters(filters, categories, catalogs, tags)}.`
              : 'Tematy bez dnia nauki pojawią się tutaj.'
          }
        />
      ) : (
        <TopicList topics={backlog} scope="backlog" folded={false} />
      )}
    </ModalShell>
  );
};
