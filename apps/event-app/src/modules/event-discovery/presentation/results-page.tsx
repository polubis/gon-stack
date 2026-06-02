import { useState, useMemo } from 'react';
import { Button } from '@/libs/ui/button';
import { Text } from '@/libs/ui/text';
import { EventCard } from './event-card';
import { CategoryChips } from './category-chips';
import { SearchBar, ActiveFilters } from './search-bar';
import type { SearchState } from './search-bar';
import { categoryLabel } from './mock-data';
import type { Event } from './mock-data';

type ResultsPageProps = {
  search: SearchState;
  onSearchChange: (v: SearchState) => void;
  onSearchSubmit: () => void;
  results: Event[];
  isLoading: boolean;
  error: string | null;
  onOpenEvent: (event: Event) => void;
  onToggleSave: (id: string) => void;
  savedSet: Set<string>;
  onClearAll: () => void;
};

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const mod10 = n % 10,
    mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const ResultsPage = ({
  search,
  onSearchChange,
  onSearchSubmit,
  results,
  isLoading,
  error,
  onOpenEvent,
  onToggleSave,
  savedSet,
  onClearAll,
}: ResultsPageProps) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'date' | 'name' | 'city'>('date');

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === 'date') arr.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === 'name')
      arr.sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    else arr.sort((a, b) => a.city.localeCompare(b.city, 'pl'));
    return arr;
  }, [results, sort]);

  const clearField = (k: keyof SearchState) =>
    onSearchChange({ ...search, [k]: '' });

  const segBtn = (active: boolean) =>
    `border-0 px-3.5 py-1.5 rounded-full text-sm transition-colors ${active ? 'bg-ink text-canvas' : 'bg-transparent text-ink hover:bg-hairline'}`;

  return (
    <section className="px-8 py-12 max-w-360 mx-auto">
      <div className="mb-8">
        <Text.MonoLabel>WYNIKI WYSZUKIWANIA</Text.MonoLabel>
        <Text.SectionHeading
          as="h1"
          className="my-2 text-[clamp(36px,5vw,64px)]"
        >
          {isLoading ? (
            'Szukam…'
          ) : (
            <>
              {results.length}{' '}
              {plural(results.length, 'wydarzenie', 'wydarzenia', 'wydarzeń')}
              {search.city && (
                <>
                  {' '}
                  w <em className="not-italic text-coral">{search.city}</em>
                </>
              )}
              {search.category && <> · {categoryLabel(search.category)}</>}
            </>
          )}
        </Text.SectionHeading>
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            variant="compact"
          />
        </div>
        <ActiveFilters
          search={search}
          onClear={clearField}
          onClearAll={onClearAll}
        />
      </div>

      <div className="flex justify-between items-center gap-6 mb-6 flex-wrap">
        <CategoryChips
          value={search.category}
          onChange={(v) => onSearchChange({ ...search, category: v })}
        />
        <div className="flex gap-4 items-center">
          <div className="inline-flex bg-surface border border-card-border-c rounded-full p-1 items-center">
            <button
              className={segBtn(layout === 'grid')}
              onClick={() => setLayout('grid')}
            >
              Siatka
            </button>
            <button
              className={segBtn(layout === 'list')}
              onClick={() => setLayout('list')}
            >
              Lista
            </button>
          </div>
          <div className="inline-flex bg-surface border border-card-border-c rounded-full p-1 items-center gap-0">
            <span className="text-xs text-muted px-2.5">Sortuj:</span>
            {(['date', 'name', 'city'] as const).map((k) => (
              <button
                key={k}
                className={segBtn(sort === k)}
                onClick={() => setSort(k)}
              >
                {k === 'date' ? 'Data' : k === 'name' ? 'Nazwa' : 'Miasto'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Text.MonoLabel>ŁADOWANIE…</Text.MonoLabel>
        </div>
      ) : error ? (
        <div className="py-20 px-8 text-center bg-surface rounded-lg flex flex-col items-center gap-3">
          <Text.MonoLabel>BŁĄD</Text.MonoLabel>
          <h2 className="font-display font-medium text-[32px] m-1">
            Nie udało się pobrać wyników.
          </h2>
          <p className="text-body-muted m-0 mb-4">{error}</p>
          <Button variant="primary" onClick={onClearAll}>
            Spróbuj ponownie
          </Button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-20 px-8 text-center bg-surface rounded-lg flex flex-col items-center gap-3">
          <Text.MonoLabel>BRAK WYNIKÓW</Text.MonoLabel>
          <h2 className="font-display font-medium text-[32px] m-1">
            Nic nie pasuje do tych filtrów.
          </h2>
          <p className="text-body-muted m-0 mb-4">
            Spróbuj zmienić miasto, datę lub kategorię — albo wyczyść filtry.
          </p>
          <Button variant="primary" onClick={onClearAll}>
            Wyczyść filtry
          </Button>
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 2xl:grid-cols-4">
          {sorted.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              layout="grid"
              onOpen={onOpenEvent}
              onToggleSave={onToggleSave}
              saved={savedSet.has(e.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              layout="list"
              onOpen={onOpenEvent}
              onToggleSave={onToggleSave}
              saved={savedSet.has(e.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
