import { useEffect, useState } from 'react';
import type { ToastNotice } from '@/shared/ui/toast';
import {
  deleteSuggestionValue,
  fetchSuggestions,
  postSuggestionUse,
  putSuggestionName,
} from '../integration/repository';
import {
  removeSuggestion,
  renameSuggestion,
  sameValue,
  type Suggestion,
  type SuggestionField,
} from '../domain/suggestions';

export type SuggestionNotice = ToastNotice & { id: number };

type Suggestions = {
  items: Suggestion[];
  /** `true` once the account's values arrived (or failed to). */
  loaded: boolean;
  /** Counts one more use of each non-blank value. Never throws. */
  recordUse: (uses: { field: SuggestionField; value: string }[]) => void;
  /** Optimistic rename; reverted with an error notice when the server refuses. */
  rename: (field: SuggestionField, value: string, newValue: string) => void;
  /** Optimistic delete; restored with an error notice when the server refuses. */
  remove: (field: SuggestionField, value: string) => void;
  notice: SuggestionNotice | null;
  dismissNotice: () => void;
};

/** The account's remembered field values, loaded once per mount. */
export const useSuggestions = (): Suggestions => {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<SuggestionNotice | null>(null);

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

  const announce = (next: ToastNotice) =>
    setNotice({ ...next, id: Date.now() + Math.random() });

  const rename = (field: SuggestionField, value: string, newValue: string) => {
    const before = items.find(
      (i) => i.field === field && sameValue(i.value, value),
    );
    setItems((prev) => renameSuggestion(prev, field, value, newValue));
    putSuggestionName(field, value, newValue)
      .then(() => announce({ tone: 'success', message: 'Zmieniono nazwę' }))
      .catch((error: unknown) => {
        if (before)
          setItems((prev) =>
            renameSuggestion(prev, field, newValue, before.value),
          );
        announce({
          tone: 'error',
          title: 'Nie udało się zmienić nazwy',
          code: 'SUGGESTION_RENAME_FAILED',
          description:
            error instanceof Error ? error.message : 'Spróbuj ponownie.',
          retry: () => rename(field, value, newValue),
        });
      });
  };

  const remove = (field: SuggestionField, value: string) => {
    const before = items.find(
      (i) => i.field === field && sameValue(i.value, value),
    );
    setItems((prev) => removeSuggestion(prev, field, value));
    deleteSuggestionValue(field, value)
      .then(() => announce({ tone: 'success', message: 'Usunięto' }))
      .catch((error: unknown) => {
        if (before) setItems((prev) => [...prev, before]);
        announce({
          tone: 'error',
          title: 'Nie udało się usunąć',
          code: 'SUGGESTION_DELETE_FAILED',
          description:
            error instanceof Error ? error.message : 'Spróbuj ponownie.',
          retry: () => remove(field, value),
        });
      });
  };

  return {
    items,
    loaded,
    recordUse: (uses) => {
      for (const { field, value } of uses)
        if (value.trim())
          postSuggestionUse(field, value.trim()).catch(() => {});
    },
    rename,
    remove,
    notice,
    dismissNotice: () => setNotice(null),
  };
};
