import { useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Film,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { dayLabel } from '@/shared/date/date';
import { openModal } from '@/shared/router/modal-stack';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { changeProps, type ChangePhase } from '@/shared/ui/list-changes';
import { progressLabel, topicFill } from '../domain/learning';
import { stateOf } from '../domain/filters';
import type { Topic } from '../domain/models';
import { useContext } from './context';
import {
  deleteModal,
  editModal,
  reelsModal,
  reelViewerModal,
} from './modal-ids';

/** Label of the main action: where the topic stands decides it. */
const playLabel = (topic: Topic): string =>
  stateOf(topic) === 'untouched'
    ? 'Start'
    : stateOf(topic) === 'done'
      ? 'Powtórz'
      : 'Kontynuuj';

const ICON_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/**
 * Topic line: title, tags, `x/y` reels, study day and a progress bar. Opens
 * to the description and the actions; Start / Continue opens the reel viewer.
 */
export const TopicRow = ({
  topic,
  phase = 'idle',
}: {
  topic: Topic;
  phase?: ChangePhase;
}) => {
  const { tags } = useContext();
  const [open, setOpen] = useState(false);
  const change = changeProps(phase);
  const own = tags.filter((tag) => topic.tagIds.includes(tag.id));
  const panel = `topic-panel-${topic.id}`;
  return (
    <li
      data-e2e={`knowledge:topic:${topic.id}`}
      aria-hidden={change['aria-hidden']}
      inert={change.inert}
      className={cn(
        'flex flex-col rounded-2xl transition-colors duration-200 hover:bg-hover-soft motion-reduce:transition-none',
        change.className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        aria-label={`${topic.title}, rolki ${progressLabel(topic)}`}
        data-e2e={`knowledge:topic-toggle:${topic.id}`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 rounded-2xl p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="break-words text-sm font-medium">{topic.title}</span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
            <span className="font-medium tabular-nums text-ink">
              {progressLabel(topic)} rolek
            </span>
            {topic.studyDay ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" aria-hidden="true" />
                <time dateTime={topic.studyDay}>
                  {dayLabel(topic.studyDay)}
                </time>
              </span>
            ) : null}
            {own.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand"
              >
                {tag.name}
              </span>
            ))}
          </span>
          <ProgressBar
            pct={topicFill(topic) * 100}
            label={`Postęp tematu: ${topic.title}`}
          />
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'mt-1 size-4 shrink-0 text-ink-soft transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      {open ? (
        <div
          id={panel}
          className="flex flex-col gap-3 px-2 pb-3 animate-view-enter motion-reduce:animate-none"
        >
          {topic.description ? (
            <p className="break-words text-sm text-ink-soft">
              {topic.description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              className="w-auto px-4 py-2"
              disabled={topic.reelCount === 0}
              data-e2e={`knowledge:topic-play:${topic.id}`}
              aria-label={`${playLabel(topic)}: ${topic.title}`}
              onClick={() => openModal(reelViewerModal(topic.id))}
            >
              <Play className="size-4" aria-hidden="true" />
              {playLabel(topic)}
            </Button>
            <button
              type="button"
              aria-label={`Rolki tematu: ${topic.title}`}
              data-e2e={`knowledge:topic-reels:${topic.id}`}
              onClick={() => openModal(reelsModal(topic.id))}
              className={ICON_BUTTON}
            >
              <Film className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Edytuj temat: ${topic.title}`}
              data-e2e={`knowledge:topic-edit:${topic.id}`}
              onClick={() => openModal(editModal('topic', topic.id))}
              className={ICON_BUTTON}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`Usuń temat: ${topic.title}`}
              data-e2e={`knowledge:topic-delete:${topic.id}`}
              onClick={() => openModal(deleteModal('topic', topic.id))}
              className={ICON_BUTTON}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
};
