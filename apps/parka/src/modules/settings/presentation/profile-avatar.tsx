import { useRef } from 'react';
import { Camera, CircleUser, Loader2 } from 'lucide-react';
import { useImageEditor } from '@/shared/image-editor/presentation/use-image-editor';
import type { Avatar } from '../domain/models';

type Props = {
  avatar: Avatar | null;
  uploading: boolean;
  onPick: (file: File) => void;
};

/** Profile picture that is itself the control to change it. Falls back to the default icon. */
export const ProfileAvatar = ({ avatar, uploading, onPick }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const { select, editor } = useImageEditor('avatar', onPick);

  return (
    <div className="shrink-0" data-e2e="settings:avatar">
      <button
        type="button"
        aria-label="Zmień zdjęcie profilowe"
        aria-busy={uploading}
        disabled={uploading}
        onClick={() => input.current?.click()}
        className="group relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-progress"
      >
        <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand md:h-28 md:w-28 lg:h-32 lg:w-32">
          {avatar ? (
            <img
              data-e2e="settings:avatar-image"
              alt="Twoje zdjęcie profilowe"
              src={avatar.variants.at(-1)?.url}
              srcSet={avatar.variants
                .map((v) => `${v.url} ${v.size}w`)
                .join(', ')}
              sizes="(min-width: 64rem) 8rem, (min-width: 48rem) 7rem, 6rem"
              className="h-full w-full object-cover"
            />
          ) : (
            <CircleUser className="h-1/2 w-1/2" aria-hidden="true" />
          )}
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-brand text-on-brand transition-transform group-hover:scale-110 motion-reduce:transition-none"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </span>
      </button>
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
          if (file) select(file);
        }}
      />
      {editor}
    </div>
  );
};
