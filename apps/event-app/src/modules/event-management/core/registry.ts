import { eda } from '@/libs/eda';
import { type Store } from './store';
import { type Event } from '../contracts/events';
import { geocodeAddressHandler } from './handlers/geocode-address';
import { suggestKeywordsHandler } from './handlers/suggest-keywords';
import { submitCreateEventHandler } from './handlers/submit-create-event';
import { addKeywordHandler } from './handlers/add-keyword';
import { removeKeywordHandler } from './handlers/remove-keyword';
import { acceptSuggestionHandler } from './handlers/accept-suggestion';
import { dismissSuggestionHandler } from './handlers/dismiss-suggestion';
import { setKeywordInputHandler } from './handlers/set-keyword-input';

export type OfType = ReturnType<typeof eda<Event>>['ofType'];

export const createRegistry = (store: Store) => {
  const { ofType, trigger, createRegistry: register } = eda<Event>();

  const registry = register(
    geocodeAddressHandler(store, ofType),
    suggestKeywordsHandler(store, ofType),
    submitCreateEventHandler(store, ofType),
    addKeywordHandler(store, ofType),
    removeKeywordHandler(store, ofType),
    acceptSuggestionHandler(store, ofType),
    dismissSuggestionHandler(store, ofType),
    setKeywordInputHandler(store, ofType),
  );

  return { trigger, registry };
};

export type Registry = ReturnType<typeof createRegistry>;
