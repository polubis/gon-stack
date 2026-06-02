import { Button } from '@/libs/ui/button';
import { Poster } from './poster';
import { Text } from '@/libs/ui/text';
import { IconHeart, IconPin, IconClock, IconArrow } from './icons';
import { fmtDate, fmtDayNum, fmtMonthShort, categoryLabel } from './mock-data';
import type { Event } from './mock-data';

type EventCardLayout = 'grid' | 'list';

type EventCardProps = {
  event: Event;
  layout?: EventCardLayout;
  onOpen: (event: Event) => void;
  onToggleSave: (id: string) => void;
  saved: boolean;
};

export const EventCard = ({
  event,
  layout = 'grid',
  onOpen,
  onToggleSave,
  saved,
}: EventCardProps) => {
  if (layout === 'list') {
    return (
      <article
        className="grid gap-5 items-center p-4.5 bg-card-bg border border-card-border-c rounded-[14px] cursor-pointer hover:border-ink transition-colors grid-cols-[80px_100px_1fr_auto]"
        onClick={() => onOpen(event)}
      >
        <div className="text-center border-r border-hairline pr-3">
          <Text.DateNum as="div">{fmtDayNum(event.date)}</Text.DateNum>
          <div className="font-mono text-[11px] tracking-[0.18em] text-coral">
            {fmtMonthShort(event.date)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {new Date(event.date).getFullYear()}
          </div>
        </div>
        <div className="aspect-3/4 h-27.5 rounded-sm overflow-hidden">
          <Poster event={event} size="sm" />
        </div>
        <div>
          <Text.MonoLabel>
            {categoryLabel(event.category).toUpperCase()} ·{' '}
            {event.city.toUpperCase()}
          </Text.MonoLabel>
          <Text.CardTitleLg className="my-1.5">{event.name}</Text.CardTitleLg>
          <div className="flex gap-4.5 text-sm text-body-muted">
            <span className="inline-flex gap-1.5 items-center">
              <IconPin size={14} /> {event.venue}
            </span>
            <span className="inline-flex gap-1.5 items-center">
              <IconClock size={14} /> {event.time}
            </span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className={`w-9 h-9 rounded-full border inline-flex items-center justify-center transition-colors ${saved ? 'text-coral border-coral' : 'bg-surface border-card-border-c text-ink'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(event.id);
            }}
            aria-label={saved ? 'Usuń z zapisanych' : 'Zapisz'}
          >
            <IconHeart fill={saved ? 'currentColor' : 'none'} size={18} />
          </button>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(event);
            }}
          >
            Szczegóły <IconArrow size={14} />
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="bg-card-bg border border-card-border-c rounded-md overflow-hidden cursor-pointer transition-[translate,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-25px_rgba(0,0,0,0.25)] flex flex-col"
      onClick={() => onOpen(event)}
    >
      <div className="relative aspect-3/4 rounded-[10px] overflow-hidden m-2.5">
        <Poster event={event} size="md" />
        {event.badge && (
          <span className="absolute top-3 left-3 bg-coral text-white font-mono text-[10px] tracking-[0.16em] px-2 py-1 rounded-[6px] uppercase">
            {event.badge}
          </span>
        )}
        <button
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full border-0 inline-flex items-center justify-center transition-colors ${saved ? 'bg-coral text-white' : 'bg-white/90 text-ink'}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(event.id);
          }}
          aria-label={saved ? 'Usuń z zapisanych' : 'Zapisz'}
        >
          <IconHeart fill={saved ? 'currentColor' : 'none'} size={16} />
        </button>
      </div>
      <div className="px-3.5 py-3 pb-4 flex flex-col gap-2.5">
        <Text.MonoLabel>
          {fmtDate(event.date)} · {event.city}
        </Text.MonoLabel>
        <Text.CardTitle className="m-0">{event.name}</Text.CardTitle>
        <div className="flex justify-between gap-3 text-body-muted text-xs">
          <span className="bg-surface rounded-[6px] px-2 py-0.5">
            {categoryLabel(event.category)}
          </span>
          <span className="truncate">{event.venue}</span>
        </div>
      </div>
    </article>
  );
};
