import { useEffect, useState } from 'react';
import { fetchSuggestions, postSuggestionUse } from '../integration/repository';
import type { Suggestion, SuggestionField } from '../domain/suggestions';

type Suggestions = {
  items: Suggestion[];
  /** `true` once the account's values arrived (or failed to). */
  loaded: boolean;
  /** Counts one more use of each non-blank value. Never throws. */
  recordUse: (uses: { field: SuggestionField; value: string }[]) => void;
};

/** The account's remembered field values, loaded once per mount. */
export const useSuggestions = (): Suggestions => {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchSuggestions(controller.signal)
      .then(setItems)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoaded(true);
      });
    return () => controller.abort();
  }, []);

  return {
    items,
    loaded,
    recordUse: (uses) => {
      for (const { field, value } of uses)
        if (value.trim())
          postSuggestionUse(field, value.trim()).catch(() => {});
    },
  };
};
