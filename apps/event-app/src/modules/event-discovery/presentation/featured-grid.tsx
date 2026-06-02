import { Button } from '@/libs/ui/button';
import { Text } from '@/libs/ui/text';
import { EventCard } from './event-card';
import { IconArrow } from './icons';
import type { Event } from './mock-data';

type FeaturedGridProps = {
  events: Event[];
  onOpen: (event: Event) => void;
  onToggleSave: (id: string) => void;
  savedSet: Set<string>;
  onBrowseAll: () => void;
};

export const FeaturedGrid = ({
  events,
  onOpen,
  onToggleSave,
  savedSet,
  onBrowseAll,
}: FeaturedGridProps) => (
  <section className="px-8 pb-12 max-w-360 mx-auto">
    <div className="flex justify-between items-end gap-8 mt-18 mb-7">
      <div>
        <Text.MonoLabel>WYDARZENIA POLECANE</Text.MonoLabel>
        <Text.SectionHeading className="mt-2 max-w-180">
          Najgłośniejsze afisze tygodnia.
        </Text.SectionHeading>
      </div>
      <Button
        variant="ghost"
        className="whitespace-nowrap"
        onClick={onBrowseAll}
      >
        Zobacz wszystkie <IconArrow size={14} />
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 2xl:grid-cols-4">
      {events.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          onOpen={onOpen}
          onToggleSave={onToggleSave}
          saved={savedSet.has(e.id)}
        />
      ))}
    </div>
  </section>
);
