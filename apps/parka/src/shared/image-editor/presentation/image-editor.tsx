import * as Dialog from '@radix-ui/react-dialog';
import { RotateCcw, RotateCw } from 'lucide-react';
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useModalMounted } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import {
  NUDGE,
  PREVIEW_SIZE,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../configuration/constraints';
import { pan, turn, type Center, type Rotation } from '../domain/crop';
import {
  decodeImage,
  exportCrop,
  paintCrop,
  type Decoded,
} from '../integration/crop-image';

const CENTER: Center = { x: 0.5, y: 0.5 };

const ICON_BUTTON =
  'grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink-soft transition-colors hover:bg-hover-soft disabled:opacity-50';

/**
 * Crop area, zoom and rotation for one picked image, stacked over the
 * screen it came from. Confirm hands back the edited square as a new file.
 */
export const ImageEditor = ({
  modal,
  file,
  onConfirm,
  onCancel,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  file: File;
  onConfirm: (edited: File) => void;
  /** `undecodable`: the original file goes on unedited. */
  onCancel: (reason: 'cancelled' | 'undecodable') => void;
}) => {
  useModalMounted(modal);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [decoded, setDecoded] = useState<Decoded | null>(null);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [zoom, setZoom] = useState<number>(ZOOM_MIN);
  const [center, setCenter] = useState<Center>(CENTER);
  const [saving, setSaving] = useState(false);

  const fail = useEffectEvent(() => onCancel('undecodable'));

  useEffect(() => {
    let current = true;
    decodeImage(file).then(
      (next) => {
        if (current) setDecoded(next);
      },
      () => {
        if (current) fail();
      },
    );
    return () => {
      current = false;
    };
  }, [file]);

  useEffect(() => {
    if (decoded && canvas.current)
      paintCrop(canvas.current, decoded, { rotation, zoom, center });
  }, [decoded, rotation, zoom, center]);

  const move = (dx: number, dy: number) => {
    if (decoded) setCenter(pan(decoded.size, rotation, zoom, center, dx, dy));
  };

  const rotate = (quarters: 1 | -1) => {
    setRotation(turn(rotation, quarters));
    setCenter(CENTER);
  };

  const changeZoom = (next: number) => {
    const clamped = Math.min(Math.max(next, ZOOM_MIN), ZOOM_MAX);
    setZoom(clamped);
    if (decoded) setCenter(pan(decoded.size, rotation, clamped, center, 0, 0));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(-NUDGE, 0),
      ArrowRight: () => move(NUDGE, 0),
      ArrowUp: () => move(0, -NUDGE),
      ArrowDown: () => move(0, NUDGE),
      '+': () => changeZoom(zoom + ZOOM_STEP),
      '=': () => changeZoom(zoom + ZOOM_STEP),
      '-': () => changeZoom(zoom - ZOOM_STEP),
    };
    const run = keys[event.key];
    if (!run) return;
    event.preventDefault();
    run();
  };

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const width = event.currentTarget.getBoundingClientRect().width || 1;
    move(
      -(event.clientX - drag.current.x) / width,
      -(event.clientY - drag.current.y) / width,
    );
    drag.current = { x: event.clientX, y: event.clientY };
  };

  const confirm = async () => {
    if (!decoded) return;
    setSaving(true);
    try {
      onConfirm(await exportCrop(file, decoded, { rotation, zoom, center }));
    } catch {
      onCancel('undecodable');
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onCancel('cancelled');
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="image-editor:dialog"
          className="fixed inset-x-4 top-1/2 z-(--z-modal) mx-auto max-h-[calc(100dvh-2rem)] max-w-md -translate-y-1/2 space-y-4 overflow-y-auto rounded-2xl bg-card p-4 focus:outline-none"
        >
          <Dialog.Title className="text-base font-semibold">
            Przytnij zdjęcie
          </Dialog.Title>
          <Dialog.Description
            id="image-editor-hint"
            className="text-sm text-ink-soft"
          >
            Przeciągnij lub użyj strzałek, aby wybrać kadr. Plus i minus
            zmieniają powiększenie.
          </Dialog.Description>
          <div className="relative mx-auto aspect-square w-[min(100%,20rem,45dvh)] overflow-hidden rounded-xl bg-track">
            {decoded ? null : (
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-pulse bg-track-strong motion-reduce:animate-none"
              />
            )}
            <canvas
              ref={canvas}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              tabIndex={0}
              role="img"
              aria-label="Podgląd kadru"
              aria-describedby="image-editor-hint"
              data-e2e="image-editor:preview"
              className="h-full w-full cursor-grab touch-none focus-visible:outline-2 focus-visible:outline-brand active:cursor-grabbing"
              onKeyDown={onKeyDown}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, y: event.clientY };
              }}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-on-brand shadow-[0_0_0_100vmax_var(--overlay)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Obróć w lewo"
              data-e2e="image-editor:rotate-left"
              disabled={!decoded}
              className={ICON_BUTTON}
              onClick={() => rotate(-1)}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="range"
              aria-label="Powiększenie"
              data-e2e="image-editor:zoom"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              disabled={!decoded}
              className="min-w-0 flex-1 accent-brand"
              onChange={(event) => changeZoom(Number(event.target.value))}
            />
            <button
              type="button"
              aria-label="Obróć w prawo"
              data-e2e="image-editor:rotate-right"
              disabled={!decoded}
              className={ICON_BUTTON}
              onClick={() => rotate(1)}
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto"
              data-e2e="image-editor:cancel"
              onClick={() => onCancel('cancelled')}
            >
              Anuluj
            </Button>
            <Button
              className="w-auto"
              data-e2e="image-editor:confirm"
              disabled={!decoded || saving}
              onClick={confirm}
            >
              {saving ? 'Zapisywanie…' : 'Zatwierdź'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
