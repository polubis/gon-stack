import { X, Plus, Loader2, Sparkles } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/libs/ui/cn';
import { type FormValues } from '../schema';
import { inputCls } from '../field';
import { useContext } from '../../context';

// ── Component ──────────────────────────────────────────────────────────────────

export const KeywordsSection = () => {
  const { $keywords, $keywordInput, $aiSuggestions, $isSuggesting, trigger } =
    useContext();
  const keywords = $keywords.use();
  const keywordInput = $keywordInput.use();
  const aiSuggestions = $aiSuggestions.use();
  const isSuggesting = $isSuggesting.use();

  const { getValues } = useFormContext<FormValues>();

  const handleSuggest = () => {
    const name = getValues('name');
    if (!name) {
      toast.error('Podaj najpierw nazwę wydarzenia.');
      return;
    }
    trigger('[TRIGGER]_SUGGEST_KEYWORDS', {
      name,
      description: getValues('description'),
      category: getValues('category'),
    });
  };

  return (
    <section id="keywords" className="flex flex-col gap-6 scroll-mt-20">
      <div className="flex items-baseline gap-3 pb-4 border-b border-hairline">
        <span className="mono-label">05</span>
        <h2 className="subsection-heading text-ink">Słowa kluczowe</h2>
      </div>

      <p className="text-sm text-body-muted -mt-2">
        Tagi ułatwiają wyszukiwanie Twojego wydarzenia przez innych
        użytkowników.
      </p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 bg-soft-stone text-ink text-sm px-3 py-1.5 rounded-pill"
            >
              {kw}
              <button
                type="button"
                onClick={() =>
                  trigger('[TRIGGER]_REMOVE_KEYWORD', { keyword: kw })
                }
                aria-label={`Usuń ${kw}`}
                className="text-muted hover:text-ink transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Dodaj słowo kluczowe…"
          value={keywordInput}
          onChange={(e) =>
            trigger('[TRIGGER]_SET_KEYWORD_INPUT', { value: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              trigger('[TRIGGER]_ADD_KEYWORD', { keyword: keywordInput });
            }
          }}
          className={cn(inputCls(), 'flex-1')}
        />
        <button
          type="button"
          onClick={() =>
            trigger('[TRIGGER]_ADD_KEYWORD', { keyword: keywordInput })
          }
          aria-label="Dodaj"
          className="px-4 rounded-xs border border-hairline bg-surface text-ink hover:border-ink transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={isSuggesting}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink border border-hairline rounded-pill px-4 py-2.5 hover:border-ink transition-colors disabled:opacity-50"
        >
          {isSuggesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Sugeruj słowa kluczowe (AI)
        </button>
      </div>

      {aiSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-3">
            Sugestie AI — kliknij, aby dodać:
          </p>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((kw) => (
              <div
                key={kw}
                className="inline-flex items-center border border-hairline rounded-pill overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    trigger('[TRIGGER]_ACCEPT_SUGGESTION', { keyword: kw })
                  }
                  className="px-3 py-1.5 text-sm text-ink hover:bg-soft-stone transition-colors"
                >
                  {kw}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    trigger('[TRIGGER]_DISMISS_SUGGESTION', { keyword: kw })
                  }
                  aria-label={`Odrzuć ${kw}`}
                  className="px-2.5 py-1.5 border-l border-hairline text-muted hover:text-ink transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
