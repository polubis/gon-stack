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
 * Mic that opens a dictation preview: speech is shown live in the overlay and
 * written into `target` (appended to its text, once, via the normal change
 * event) only when the user accepts. Renders nothing where speech recognition
 * is unavailable.
 */
export const DictationButton = ({ target, label, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<DictationError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const dictation = useDictation({
    lang: DICTATION_LANG,
    onError: (e) => {
      setError(e);
      if (dictation.transcript === '') setOpen(false);
    },
  });

  if (!dictation.supported) return null;

  const begin = () => {
    if (open) return;
    setError(null);
    setOpen(true);
    dictation.start();
  };

  const close = () => {
    dictation.stop();
    dictation.reset();
    setOpen(false);
    target.current?.focus();
  };

  const accept = () => {
    const el = target.current;
    if (el) {
      const next = joinText(el.value, dictation.transcript);
      setNativeValue(el, el.maxLength > 0 ? next.slice(0, el.maxLength) : next);
    }
    close();
  };

  return (
    <>
      <button
        type="button"
        aria-label={`${open ? 'Zatrzymaj dyktowanie' : 'Dyktuj'}: ${label}`}
        aria-pressed={open}
        data-e2e={`dictation:start:${label}`}
        disabled={open}
        onClick={begin}
        className={cn(
          'grid h-6 w-6 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          open &&
            'animate-pulse bg-danger-soft text-danger motion-reduce:animate-none',
          className,
        )}
      >
        <Mic className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <VoiceOverlay
          label={label}
          transcript={dictation.transcript}
          listening={dictation.listening}
          onToggle={() =>
            dictation.listening ? dictation.stop() : dictation.start(true)
          }
          onEdit={dictation.edit}
          onAccept={accept}
          onCancel={close}
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
