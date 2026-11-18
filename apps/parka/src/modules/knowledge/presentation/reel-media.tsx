import { ImageOff } from 'lucide-react';
import type { ReelMedia } from '../domain/models';

/** Picture or clip of a reel; no autoplay, native controls for video. */
export const ReelMediaView = ({
  media,
  label,
}: {
  media: ReelMedia;
  label: string;
}) =>
  media.url === null ? (
    <p className="flex items-center gap-2 rounded-2xl bg-track p-3 text-sm text-ink-soft">
      <ImageOff className="size-4 shrink-0" aria-hidden="true" />
      Nie udało się wczytać mediów.
    </p>
  ) : media.kind === 'image' ? (
    <img
      src={media.url}
      alt={label}
      loading="lazy"
      draggable={false}
      className="max-h-[50dvh] w-full rounded-2xl bg-track object-contain"
    />
  ) : (
    <video
      src={media.url}
      aria-label={label}
      controls
      playsInline
      preload="metadata"
      className="max-h-[50dvh] w-full rounded-2xl bg-track"
    />
  );
