import { Hero } from './hero';
import { FeaturedGrid } from './featured-grid';
import { CategoryBand } from './category-band';
import type { SearchState } from './search-bar';
import type { Event } from './mock-data';

type LandingProps = {
  search: SearchState;
  onSearchChange: (v: SearchState) => void;
  onSearchSubmit: () => void;
  onQuickSearch: (query: Partial<SearchState>) => void;
  featuredEvents: Event[];
  onOpenEvent: (event: Event) => void;
  onToggleSave: (id: string) => void;
  savedSet: Set<string>;
  onPickCategory: (id: string) => void;
  onBrowseAll: () => void;
};

export const Landing = ({
  search,
  onSearchChange,
  onSearchSubmit,
  onQuickSearch,
  featuredEvents,
  onOpenEvent,
  onToggleSave,
  savedSet,
  onPickCategory,
  onBrowseAll,
}: LandingProps) => (
  <>
    <Hero
      search={search}
      onChange={onSearchChange}
      onSubmit={onSearchSubmit}
      onQuickSearch={onQuickSearch}
    />
    <FeaturedGrid
      events={featuredEvents}
      onOpen={onOpenEvent}
      onToggleSave={onToggleSave}
      savedSet={savedSet}
      onBrowseAll={onBrowseAll}
    />
    <CategoryBand onPick={onPickCategory} />
  </>
);
