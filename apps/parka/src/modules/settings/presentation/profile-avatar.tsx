import { useRef } from 'react';
import { CircleUser } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import type { Avatar } from '../domain/models';

type Props = {
  avatar: Avatar | null;
  uploading: boolean;
  onPick: (file: File) => void;
};

/** Profile picture with the only control to change it. Falls back to the default icon. */
export const ProfileAvatar = ({ avatar, uploading, onPick }: Props) => {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-1.5"
      data-e2e="settings:avatar"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand">
        {avatar ? (
          <img
            data-e2e="settings:avatar-image"
            alt="Twoje zdjęcie profilowe"
            src={avatar.variants.at(-1)?.url}
            srcSet={avatar.variants
              .map((v) => `${v.url} ${v.size}w`)
              .join(', ')}
            sizes="3rem"
            className="h-full w-full object-cover"
          />
        ) : (
          <CircleUser className="h-6 w-6" aria-hidden="true" />
        )}
      </span>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        data-e2e="settings:avatar-input"
        aria-label="Wybierz zdjęcie profilowe"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onPick(file);
        }}
      />
      <Button
        variant="ghost"
        className="w-auto px-2 py-1 text-xs"
        data-e2e="settings:avatar-change"
        disabled={uploading}
        onClick={() => input.current?.click()}
      >
        {uploading ? 'Przesyłanie…' : 'Zmień zdjęcie'}
      </Button>
    </div>
  );
};
