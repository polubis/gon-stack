import { useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Mic } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { VoiceOverlay } from './voice-overlay';
import { Toast } from '@/shared/ui/toast';
import { setNativeValue } from '@/shared/ui/native-value';
import { useDictation, type DictationError } from './use-dictation';

const DICTATION_LANG = 'pl-PL';

type Props = {
  target: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** Accessible name of the field being dictated into. */
  label: string;
  className?: string;
};

const joinText = (base: string, text: string) =>
  base === '' || base.endsWith(' ') || text === ''
    ? base + text
    : `${base} ${text}`;

/**
 * Mic toggle that dictates into `target`: the transcript is appended to the
 * text present when dictation started and flows through the normal change
 * event. Renders nothing where speech recognition is unavailable.
 */
export const DictationButton = ({ target, label, className }: Props) => {
  const [base, setBase] = useState('');
  const [error, setError] = useState<DictationError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const dictation = useDictation({
    lang: DICTATION_LANG,
    onText: (text) => {
      const el = target.current;
      if (!el) return;
      const next = joinText(base, text);
      setNativeValue(el, el.maxLength > 0 ? next.slice(0, el.maxLength) : next);
    },
    onError: setError,
  });

  if (!dictation.supported) return null;

  const begin = () => {
    if (dictation.listening) return;
    setError(null);
    setBase(target.current?.value ?? '');
    dictation.start();
  };

  return (
    <>
      <button
        type="button"
        aria-label={`${dictation.listening ? 'Zatrzymaj dyktowanie' : 'Dyktuj'}: ${label}`}
        aria-pressed={dictation.listening}
        disabled={dictation.listening}
        onClick={begin}
        className={cn(
          'grid h-6 w-6 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          dictation.listening &&
            'animate-pulse bg-danger-soft text-danger motion-reduce:animate-none',
          className,
        )}
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
      </button>
      {dictation.listening ? (
        <VoiceOverlay
          label={label}
          onStop={() => {
            dictation.stop();
            target.current?.focus();
          }}
        />
      ) : null}
      {error
        ? createPortal(
            <Toast
              key={attempt}
              notice={{
                tone: 'error',
                title: error.denied
                  ? 'Brak dostępu do mikrofonu'
                  : 'Nie udało się nagrać głosu',
                code: error.code,
                description: error.denied
                  ? 'Zezwól na mikrofon w ustawieniach przeglądarki.'
                  : 'Sprawdź mikrofon i połączenie, potem spróbuj ponownie.',
                retry: () => {
                  setAttempt((n) => n + 1);
                  begin();
                },
              }}
              onClose={() => setError(null)}
            />,
            document.body,
          )
        : null}
    </>
  );
};
