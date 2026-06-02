import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { Provider, useContext } from './context';
import { Header } from './header';
import type { Route } from './header';
import { Landing } from './landing';
import { Footer } from './footer';
import { ResultsPage } from './results-page';
import { DetailsPage } from './details-page';
import { EVENTS } from './mock-data';
import type { Event as MockEvent } from './mock-data';
import type { SearchState } from './search-bar';
import type { EventCard as ApiEventCard } from '../core/store';

type MainProps = {
  user: User | null;
};

const EMPTY_SEARCH: SearchState = {
  name: '',
  category: '',
  city: '',
  date: '',
};

const toMockEvent = (e: ApiEventCard): MockEvent => ({
  id: e.id,
  name: e.name,
  category: e.category,
  city: e.city,
  venue: '',
  date: e.startDateTime.slice(0, 10),
  time: new Date(e.startDateTime).toLocaleTimeString('pl', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  coords: { x: 50, y: 50 },
  palette: 0,
  posterTitle: e.name,
  posterMeta: e.city,
  description: '',
  featured: false,
});

const Content = ({ user }: MainProps) => {
  const ctx = useContext();

  const results = ctx.$results.use();
  const isLoading = ctx.$isLoading.use();
  const error = ctx.$error.use();

  const [route, setRoute] = useState<Route>('home');
  const [search, setSearch] = useState<SearchState>(EMPTY_SEARCH);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  const toggleSave = (id: string) => {
    setSavedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navigate = (r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerSearch = (s: SearchState) => {
    ctx.trigger('[TRIGGER]_SEARCH', {
      name: s.name || undefined,
      category: s.category || undefined,
      city: s.city || undefined,
      dateLabel: s.date || undefined,
    });
  };

  const submitSearch = () => {
    triggerSearch(search);
    navigate('results');
  };

  const openEvent = (event: MockEvent) => {
    const found = EVENTS.find((e) => e.id === event.id);
    if (!found) return;
    setActiveEventId(found.id);
    navigate('details' as Route);
  };

  const pickCategory = (id: string) => {
    const newSearch = { ...search, category: id };
    setSearch(newSearch);
    triggerSearch(newSearch);
    navigate('results');
  };

  const quickSearch = (query: Partial<SearchState>) => {
    const newSearch = { ...search, ...query };
    setSearch(newSearch);
    triggerSearch(newSearch);
    navigate('results');
  };

  const featuredEvents = EVENTS.filter((e) => e.featured).slice(0, 8);
  const currentEvent = activeEventId
    ? (EVENTS.find((e) => e.id === activeEventId) ?? null)
    : null;

  const mappedResults = results.map(toMockEvent);

  return (
    <div className="bg-canvas min-h-screen text-ink">
      <Header
        route={route}
        onNavigate={navigate}
        savedCount={savedSet.size}
        user={user}
      />
      <main>
        {route === 'home' && (
          <Landing
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={submitSearch}
            onQuickSearch={quickSearch}
            featuredEvents={featuredEvents}
            onOpenEvent={openEvent}
            onToggleSave={toggleSave}
            savedSet={savedSet}
            onPickCategory={pickCategory}
            onBrowseAll={() => {
              setSearch(EMPTY_SEARCH);
              ctx.trigger('[TRIGGER]_SEARCH', {});
              navigate('results');
            }}
          />
        )}
        {route === 'results' && (
          <ResultsPage
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={submitSearch}
            results={mappedResults}
            isLoading={isLoading}
            error={error}
            onOpenEvent={openEvent}
            onToggleSave={toggleSave}
            savedSet={savedSet}
            onClearAll={() => {
              setSearch(EMPTY_SEARCH);
              ctx.trigger('[TRIGGER]_SEARCH', {});
            }}
          />
        )}
        {route === 'details' && currentEvent && (
          <DetailsPage
            event={currentEvent}
            allEvents={EVENTS}
            onBack={() => navigate('results')}
            onOpenEvent={openEvent}
            onToggleSave={toggleSave}
            savedSet={savedSet}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export const Main = ({ user }: MainProps) => (
  <Provider>
    <Content user={user} />
  </Provider>
);
