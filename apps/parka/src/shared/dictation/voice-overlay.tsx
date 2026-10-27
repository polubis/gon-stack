import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Mic, Square } from 'lucide-react';

const BARS = [0.55, 0.8, 1, 0.8, 0.55];

/**
 * Drives `--voice-level` (0..1) on `el` from the microphone volume.
 * Returns false while no live level is available (animation falls back to a loop).
 */
const useVoiceLevel = (el: { current: HTMLElement | null }) => {
  const [live, setLive] = useState(false);

  useEffect(() => {
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
  }, [el]);

  return live;
};

/**
 * Blocking "listening" popup with a voice-level animation. Covers the page so
 * nothing else (including a second mic press) can be triggered until stopped.
 */
export const VoiceOverlay = ({
  label,
  onStop,
}: {
  label: string;
  onStop: () => void;
}) => {
  const bars = useRef<HTMLDivElement>(null);
  const stop = useRef<HTMLButtonElement>(null);
  const live = useVoiceLevel(bars);

  useEffect(() => {
    stop.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onStop();
      }
    };
    // window capture runs before any document-level handler (e.g. a Radix dialog's Escape).
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onStop]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Dyktowanie: ${label}`}
      className="pointer-events-auto fixed inset-0 z-(--z-modal) grid place-items-center bg-ink/40 p-4 backdrop-blur-sm animate-overlay-in motion-reduce:animate-none"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-5 rounded-3xl bg-card p-8 shadow-popover animate-voice-card-in motion-reduce:animate-none">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-danger">
          <Mic className="h-6 w-6" aria-hidden="true" />
        </span>
        <div
          ref={bars}
          aria-hidden="true"
          data-live={live}
          className="flex h-12 items-center gap-1.5"
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
          Słucham…
        </p>
        <button
          ref={stop}
          type="button"
          onClick={onStop}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-card hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
          Zakończ dyktowanie
        </button>
      </div>
    </div>,
    document.body,
  );
};
