import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { dayLabel } from '@/shared/date/date';
import { isDay } from '@/shared/period/period';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import { ClearableInput, ClearableTextarea } from '@/shared/ui/clearable';
import { Button, Field, Input, Select } from '@/shared/ui/controls';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '../configuration/constraints';
import { toggled } from '../domain/filters';
import type { CatalogId, TagId, Topic } from '../domain/models';
import { useContext } from './context';
import { FieldError } from './field-error';
import { FormFooter } from './form-footer';
import { newModal } from './modal-ids';
import { ModalShell } from './modal-shell';

type Props = {
  modal: string;
  /** Topic being edited; omitted when adding. */
  topic?: Topic;
  /** Catalog a new topic starts in. */
  catalogId?: CatalogId;
  /** Day a new topic starts on; `null` = backlog. */
  defaultDay: string | null;
};

/** Add / edit topic popup; saving is optimistic (see the store handlers). */
export const TopicDialog = ({ modal, topic, catalogId, defaultDay }: Props) => {
  const { catalogs, tags, createTopic, updateTopic } = useContext();
  const [title, setTitle] = useState(topic?.title ?? '');
  const [description, setDescription] = useState(topic?.description ?? '');
  const [pickedCatalog, setCatalog] = useState<CatalogId | undefined>(
    topic?.catalogId ?? catalogId,
  );
  const [tagIds, setTagIds] = useState<TagId[]>(topic?.tagIds ?? []);
  const [day, setDay] = useState(
    topic ? (topic.studyDay ?? '') : (defaultDay ?? ''),
  );
  const [showErrors, setShowErrors] = useState(false);

  // Derived, so it still applies when the list arrives late or the pick vanished.
  const chosen = catalogs.some((c) => c.id === pickedCatalog)
    ? pickedCatalog
    : catalogs[0]?.id;
  const titleError = title.trim() === '' ? 'Podaj tytuł tematu.' : null;
  const catalogError = chosen === undefined ? 'Wybierz katalog.' : null;
  const dayError = day !== '' && !isDay(day) ? 'Podaj poprawny dzień.' : null;
  const liveTags = tagIds.filter((id) => tags.some((t) => t.id === id));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (titleError || catalogError || dayError || chosen === undefined)
      return setShowErrors(true);
    const input = {
      catalogId: chosen,
      title: title.trim(),
      description: description.trim(),
      tagIds: liveTags,
      studyDay: day === '' ? null : day,
    };
    if (topic) updateTopic({ ...topic, ...input });
    else createTopic(input);
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:topic-dialog"
      title={topic ? 'Edytuj temat' : 'Nowy temat'}
      description={
        topic ? 'Zmień szczegóły tematu.' : 'Tytuł, katalog i dzień nauki.'
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field label="Tytuł" required>
          <ClearableInput
            type="text"
            data-e2e="knowledge:topic-title"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            autoComplete="off"
            placeholder="np. Podstawy SQL"
            aria-invalid={showErrors && titleError ? true : undefined}
            aria-describedby={
              showErrors && titleError ? 'topic-title-error' : undefined
            }
            onChange={(e) => setTitle(e.target.value)}
          />
          <FieldError
            id="topic-title-error"
            message={showErrors ? titleError : null}
          />
        </Field>
        <Field label="Opis">
          <ClearableTextarea
            data-e2e="knowledge:topic-description"
            rows={3}
            value={description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <Field
          label="Katalog"
          required
          action={
            <button
              type="button"
              onClick={() => openModal(newModal('catalog'))}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-brand hover:bg-brand-softer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Plus className="h-3 w-3" aria-hidden="true" /> Katalog
            </button>
          }
        >
          <Select
            data-e2e="knowledge:topic-catalog"
            value={chosen ?? ''}
            placeholder="Wybierz katalog"
            options={catalogs.map((c) => ({ value: c.id, label: c.name }))}
            onValueChange={(value) => setCatalog(value as CatalogId)}
          />
          <FieldError
            id="topic-catalog-error"
            message={showErrors ? catalogError : null}
          />
        </Field>
        <div role="group" aria-label="Tagi" className="flex flex-col gap-2">
          <span
            aria-hidden="true"
            className="text-sm font-medium text-ink-soft"
          >
            Tagi
          </span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                aria-pressed={liveTags.includes(tag.id)}
                data-e2e={`knowledge:tag-chip:${tag.id}`}
                onClick={() => setTagIds(toggled(liveTags, tag.id))}
                className={cn(
                  'pressable inline-flex min-h-9 items-center rounded-full border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand',
                  liveTags.includes(tag.id)
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-line bg-card text-ink hover:bg-brand-softer',
                )}
              >
                {tag.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openModal(newModal('tag'))}
              className="pressable inline-flex min-h-9 items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-sm text-ink-soft hover:bg-brand-softer focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Tag
            </button>
          </div>
        </div>
        <Field
          label="Dzień nauki"
          hint={day === '' ? 'Bez dnia: temat trafi do backlogu.' : undefined}
        >
          <div className="flex items-center gap-2">
            <Input
              type="date"
              data-e2e="knowledge:topic-day"
              value={day}
              aria-invalid={showErrors && dayError ? true : undefined}
              onChange={(e) => setDay(e.target.value)}
            />
            {day !== '' ? (
              <Button
                variant="ghost"
                className="w-auto shrink-0 px-3 py-2"
                onClick={() => setDay('')}
              >
                Backlog
              </Button>
            ) : null}
          </div>
          {isDay(day) ? (
            <span className="mt-1 block text-xs text-ink-soft">
              {dayLabel(day, 'long')}
            </span>
          ) : null}
          <FieldError
            id="topic-day-error"
            message={showErrors ? dayError : null}
          />
        </Field>
        <FormFooter modal={modal} entity="topic" editId={topic?.id} />
      </form>
    </ModalShell>
  );
};
