import { useState } from 'react';
import { cn } from '@repo/react-kit/cn';

type Props = {
  label: string;
  avatarUrl: string | null;
  className?: string;
};

/** Round picture, or the first letter of `label` while none is set. */
export const AccountAvatar = ({ label, avatarUrl, className }: Props) => {
  const [broken, setBroken] = useState<string | null>(null);
  return avatarUrl && broken !== avatarUrl ? (
    <img
      src={avatarUrl}
      onError={() => setBroken(avatarUrl)}
      alt=""
      referrerPolicy="no-referrer"
      className={cn('size-8 shrink-0 rounded-full object-cover', className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-dark',
        className,
      )}
    >
      {(label[0] ?? '?').toUpperCase()}
    </span>
  );
};
