import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Mic, Square } from 'lucide-react';
import { currentDevice } from '@/shared/device/integration/current-device';
import { useWakeLock } from './use-wake-lock';

const BARS = [0.55, 0.8, 1, 0.8, 0.55];

/**
 * Phones give the mic to one consumer: a getUserMedia stream starves
 * SpeechRecognition (no audio, no result), so the meter is desktop only.
 */
const canMeter = () => currentDevice().type === 'desktop';

/**
 * Drives `--voice-level` (0..1) on `el` from the microphone volume.
 * Returns false while no live level is available (animation falls back to a loop).
 */
const useVoiceLevel = (
  el: { current: HTMLElement | null },
  listening: boolean,
) => {
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!listening || !canMeter()) return;
    let frame = 0;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    const run = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        ctx = new AudioContext();
        void ctx.resume();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        let smooth = 0;
        setLive(true);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let peak = 0;
          for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
          smooth = smooth * 0.7 + Math.min(1, (peak / 128) * 2.5) * 0.3;
          el.current?.style.setProperty('--voice-level', smooth.toFixed(3));
          frame = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setLive(false);
      }
    };
    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
      void ctx?.close();
    };
  }, [el, listening]);

  return live;
};

/**
 * Blocking dictation popup: voice-level animation plus an editable preview of
 * the transcript (dictation and typing both go there). Nothing is written
 * anywhere until `onAccept`; Esc cancels. The screen stays awake while listening.
 */
export const VoiceOverlay = ({
  label,
  transcript,
  listening,
  onToggle,
  onEdit,
  onAccept,
  onCancel,
}: {
  label: string;
  transcript: string;
  listening: boolean;
  onToggle: () => void;
  onEdit: (text: string) => void;
  onAccept: () => void;
  onCancel: () => void;
}) => {
  const bars = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const preview = useRef<HTMLTextAreaElement>(null);
  const live = useVoiceLevel(bars, listening);
  useWakeLock(listening);

  // Keep the newest words in view while speech keeps arriving; a user edit
  // leaves the scroll position alone.
  const edited = useRef(false);
  useEffect(() => {
    if (edited.current) {
      edited.current = false;
      return;
    }
    const el = preview.current;
    if (listening && el) el.scrollTop = el.scrollHeight;
  }, [transcript, listening]);

  useEffect(() => {
    toggle.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onCancel();
      }
    };
    // window capture runs before any document-level handler (e.g. a Radix dialog's Escape).
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Dyktowanie: ${label}`}
      className="pointer-events-auto fixed inset-0 z-(--z-modal) grid place-items-center bg-ink/40 p-4 backdrop-blur-sm animate-overlay-in motion-reduce:animate-none"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-card p-6 shadow-popover animate-voice-card-in motion-reduce:animate-none">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-danger">
          <Mic className="h-6 w-6" aria-hidden="true" />
        </span>
        <div
          ref={bars}
          aria-hidden="true"
          data-live={live}
          data-active={listening}
          className="flex h-10 items-center gap-1.5 data-[active=false]:opacity-30"
        >
          {BARS.map((k, i) => (
            <span
              key={i}
              style={{
                animationDelay: `${i * 0.12}s`,
                transform: live
                  ? `scaleY(calc(0.15 + var(--voice-level, 0) * ${k}))`
                  : undefined,
              }}
              className="h-full w-1.5 origin-center rounded-full bg-danger transition-transform duration-75 motion-reduce:transition-none data-[live=false]:animate-voice-bar"
              data-live={live}
            />
          ))}
        </div>
        <p role="status" className="text-sm font-medium text-ink">
          {listening ? 'Słucham…' : 'Dyktowanie zatrzymane'}
        </p>
        <textarea
          ref={preview}
          aria-label="Podgląd dyktowania"
          placeholder="Zacznij mówić…"
          value={transcript}
          onChange={(e) => {
            edited.current = true;
            onEdit(e.target.value);
          }}
          rows={6}
          className="max-h-80 min-h-32 w-full resize-none overflow-y-auto rounded-2xl bg-hover p-3 text-sm text-ink placeholder:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          ref={toggle}
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {listening ? (
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Mic className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {listening ? 'Zakończ dyktowanie' : 'Dyktuj dalej'}
        </button>
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full bg-hover px-5 py-2 text-sm font-medium text-ink hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Anuluj
          </button>
          <button
            type="button"
            disabled={transcript === ''}
            onClick={onAccept}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-card hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Wstaw
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
