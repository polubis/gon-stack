import { SearchBar } from './search-bar';
import type { SearchState } from './search-bar';
import { Text } from '@/libs/ui/text';
import { Button } from '@/libs/ui/button';

type HeroProps = {
  search: SearchState;
  onChange: (v: SearchState) => void;
  onSubmit: () => void;
  onQuickSearch: (query: Partial<SearchState>) => void;
};

const QUICK_LINKS: { label: string; query: Partial<SearchState> }[] = [
  {
    label: 'Ten weekend w Warszawie',
    query: { date: 'weekend', city: 'Warszawa' },
  },
  {
    label: 'Festiwale lato 2026',
    query: { category: 'festiwale', date: 'summer' },
  },
  { label: 'Sport · Ekstraklasa', query: { category: 'sport' } },
  {
    label: 'Stand-up · Kraków',
    query: { category: 'stand-up', city: 'Kraków' },
  },
];

export const Hero = ({
  search,
  onChange,
  onSubmit,
  onQuickSearch,
}: HeroProps) => (
  <section className="hero-bg px-8 pt-16 pb-12">
    <div className="max-w-7xl mx-auto">
      <Text.HeroDisplay className="my-4 mb-6">
        Znajdź coś,
        <br />
        co warto
        <br />
        <em className="italic text-coral">przeżyć.</em>
      </Text.HeroDisplay>

      <p className="max-w-160 text-lg leading-relaxed text-body-muted mb-8">
        Koncerty, festiwale, sport, teatr, wystawy. Wszystkie wydarzenia w
        Polsce w jednym miejscu — bez biletów, bez pośredników, tylko afisz.
      </p>
      <div className="mt-6">
        <SearchBar value={search} onChange={onChange} onSubmit={onSubmit} />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {QUICK_LINKS.map((ql) => (
          <Button
            key={ql.label}
            variant="tertiary"
            onClick={() => {
              onChange({ ...search, ...ql.query });
              onQuickSearch(ql.query);
            }}
          >
            {ql.label}
          </Button>
        ))}
      </div>
    </div>
  </section>
);
