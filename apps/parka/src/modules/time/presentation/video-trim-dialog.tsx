import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Scissors } from 'lucide-react';
import { formatFileSize } from '@/shared/attachments/rules';
import { Button } from '@/shared/ui/controls';
import { trimVideo } from '../integration/trim-video';

const STEP = 0.1;

const seconds = (value: number): string => `${value.toFixed(1)} s`;

/**
 * Lets the user cut a picked video with the native player before it is sent.
 * The cutting runs in a web worker; "send whole" skips it.
 */
export const VideoTrimDialog = ({
  file,
  onSubmit,
  onCancel,
}: {
  file: File;
  /** Receives the original or the trimmed file. */
  onSubmit: (file: File) => void;
  onCancel: () => void;
}) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const [duration, setDuration] = useState<number>();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [progress, setProgress] = useState<number>();
  const [failed, setFailed] = useState(false);

  const untouched = duration === undefined || (start === 0 && end >= duration);

  const trim = async () => {
    setFailed(false);
    setProgress(0);
    try {
      onSubmit(await trimVideo({ file, start, end }, setProgress));
    } catch {
      setProgress(undefined);
      setFailed(true);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && progress === undefined) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-black/50" />
        <Dialog.Content
          data-e2e="time:attachment-trim"
          className="fixed inset-x-4 top-1/2 z-(--z-modal) mx-auto flex max-h-[90dvh] max-w-lg -translate-y-1/2 flex-col gap-3 overflow-y-auto rounded-2xl bg-card p-4 shadow-xl focus:outline-none"
        >
          <Dialog.Title className="flex items-center gap-2 text-base font-semibold">
            <Scissors className="h-4 w-4" aria-hidden="true" />
            Przytnij nagranie
          </Dialog.Title>
          <Dialog.Description className="truncate text-xs text-ink-soft">
            {file.name} · {formatFileSize(file.size)}
          </Dialog.Description>
          <video
            src={url}
            controls
            preload="metadata"
            playsInline
            aria-label={`Podgląd: ${file.name}`}
            className="max-h-[40dvh] w-full rounded-lg bg-black"
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              if (!Number.isFinite(length)) return;
              setDuration(length);
              setEnd(length);
            }}
          />
          {duration === undefined ? null : (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Początek: {seconds(start)}
                <input
                  type="range"
                  data-e2e="time:attachment-trim-start"
                  min={0}
                  max={duration}
                  step={STEP}
                  value={start}
                  disabled={progress !== undefined}
                  onChange={(event) =>
                    setStart(Math.min(Number(event.target.value), end - STEP))
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Koniec: {seconds(end)}
                <input
                  type="range"
                  data-e2e="time:attachment-trim-end"
                  min={0}
                  max={duration}
                  step={STEP}
                  value={end}
                  disabled={progress !== undefined}
                  onChange={(event) =>
                    setEnd(Math.max(Number(event.target.value), start + STEP))
                  }
                />
              </label>
            </div>
          )}
          {failed ? (
            <p role="alert" className="text-sm text-danger">
              <span className="font-mono text-xs">ATTACHMENT_TRIM</span> Nie
              udało się przyciąć nagrania. Wyślij całość albo spróbuj ponownie.
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto px-3 py-1.5 text-xs"
              disabled={progress !== undefined}
              onClick={onCancel}
            >
              Anuluj
            </Button>
            <Button
              variant="ghost"
              className="w-auto px-3 py-1.5 text-xs"
              data-e2e="time:attachment-trim-skip"
              disabled={progress !== undefined}
              onClick={() => onSubmit(file)}
            >
              Wyślij całość
            </Button>
            <Button
              className="w-auto px-3 py-1.5 text-xs"
              data-e2e="time:attachment-trim-confirm"
              disabled={untouched || progress !== undefined}
              onClick={() => void trim()}
            >
              {progress === undefined ? null : (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              )}
              {progress === undefined
                ? 'Przytnij i wyślij'
                : `Przycinanie… ${Math.round(progress * 100)}%`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
