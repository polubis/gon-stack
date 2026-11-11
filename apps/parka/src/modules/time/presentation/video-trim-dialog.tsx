import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Loader2, Scissors, X } from 'lucide-react';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { previewUrl, readDuration, trimVideo } from '../integration/trim-video';

const STEP = 0.1;

const seconds = (value: number): string => `${value.toFixed(1)} s`;

/**
 * Asks how much of a picked video to keep. The cut runs on a web worker, so
 * the page stays responsive; `onDone(null)` means the video was dropped.
 */
export const VideoTrimDialog = ({
  modal,
  file,
  onDone,
}: {
  modal: string;
  file: File;
  onDone: (result: File | null) => void;
}) => {
  useModalMounted(modal);
  const [url] = useState(() => previewUrl(file));
  const [duration, setDuration] = useState<number>();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [progress, setProgress] = useState<number>();
  const [failed, setFailed] = useState(false);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  useEffect(() => {
    let current = true;
    readDuration(file).then(
      (length) => {
        if (!current) return;
        setDuration(length);
        setEnd(length);
      },
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [file]);

  const finish = (result: File | null) => {
    onDone(result);
    closeModal(modal);
  };
  const cut = async () => {
    setProgress(0);
    setFailed(false);
    try {
      finish(await trimVideo(file, start, end, setProgress));
    } catch {
      setProgress(undefined);
      setFailed(true);
    }
  };

  const trimming = progress !== undefined;
  const changed = duration !== undefined && (start > 0 || end < duration);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !trimming) finish(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="time:attachment-trim"
          className="fixed inset-x-4 top-1/2 z-(--z-modal) mx-auto flex max-h-[90dvh] max-w-md -translate-y-1/2 animate-view-enter flex-col gap-3 overflow-y-auto rounded-4xl border border-line bg-card p-5 shadow-lg motion-reduce:animate-none focus:outline-none"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Dialog.Title className="flex items-center gap-1.5 text-base font-semibold">
                <Scissors className="h-4 w-4" aria-hidden="true" />
                Przytnij wideo
              </Dialog.Title>
              <Dialog.Description className="truncate text-xs text-ink-soft">
                {file.name}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Anuluj"
              disabled={trimming}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <video
            src={url?.startsWith('blob:') ? url : undefined}
            onLoadedMetadata={(event) => {
              // Shows the first frame instead of a black box.
              event.currentTarget.currentTime = 0.1;
            }}
            controls
            preload="metadata"
            playsInline
            className="max-h-60 w-full rounded-lg bg-track"
          />

          {duration === undefined ? (
            failed ? (
              <p role="alert" className="text-sm text-danger">
                Nie udało się odczytać wideo. Możesz je dodać bez przycinania.
              </p>
            ) : (
              <p className="text-xs text-ink-soft">Wczytywanie wideo…</p>
            )
          ) : (
            <>
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Początek: {seconds(start)}
                <input
                  type="range"
                  data-e2e="time:trim-start"
                  min={0}
                  max={duration}
                  step={STEP}
                  value={start}
                  disabled={trimming}
                  onChange={(event) =>
                    setStart(Math.min(Number(event.target.value), end - STEP))
                  }
                  className="accent-brand"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-soft">
                Koniec: {seconds(end)}
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={STEP}
                  value={end}
                  disabled={trimming}
                  onChange={(event) =>
                    setEnd(Math.max(Number(event.target.value), start + STEP))
                  }
                  className="accent-brand"
                />
              </label>
              <p data-e2e="time:trim-length" className="text-xs text-ink-soft">
                Długość po przycięciu: {seconds(end - start)}
              </p>
              {failed ? (
                <p role="alert" className="text-sm text-danger">
                  Nie udało się przyciąć wideo. Spróbuj ponownie albo dodaj je w
                  całości.
                </p>
              ) : null}
            </>
          )}

          {trimming ? (
            <progress
              aria-label="Postęp przycinania"
              max={1}
              value={progress}
              className="h-2 w-full accent-brand"
            />
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto px-3 py-1.5 text-xs"
              disabled={trimming}
              onClick={() => finish(file)}
            >
              Dodaj bez przycinania
            </Button>
            <Button
              data-e2e="time:trim-save"
              className="w-auto px-3 py-1.5 text-xs"
              disabled={trimming || !changed}
              onClick={() => void cut()}
            >
              {trimming ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : null}
              Przytnij i dodaj
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
