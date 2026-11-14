import { Plus, User } from 'lucide-react';
import type { Avatar } from '@/shared/avatar/domain/models';
import { ACCOUNT_MODAL } from '@/shared/auth/configuration/constraints';
import { openModal } from '@/shared/router/modal-stack';
import { cn } from '@repo/react-kit/cn';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import { ScreenHeader } from '@/shared/ui/layout';
import { useOwnerEyebrow } from '@/modules/settings/presentation/owner-eyebrow';
import { AddMenu, ADD_BUTTON } from './add-menu';

export const Header = ({ avatar }: { avatar: Avatar | null }) => {
  const eyebrow = useOwnerEyebrow('Twoje');
  return (
    <div className="md:px-4 lg:px-6 xl:px-12">
      <ScreenHeader
        title="Finanse"
        eyebrow={eyebrow}
        action={
          <>
            <UnreadLink />
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label="Konto i profil"
              onClick={() => openModal(ACCOUNT_MODAL)}
              className="pressable grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-card text-ink shadow-card max-md:hidden"
            >
              {avatar ? (
                <img
                  data-e2e="dashboard:avatar-image"
                  alt="Twoje zdjęcie profilowe"
                  width={40}
                  height={40}
                  src={avatar.variants.at(-1)?.url}
                  srcSet={avatar.variants
                    .map((v) => `${v.url} ${v.size}w`)
                    .join(', ')}
                  sizes="2.5rem"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <AddMenu
              side="bottom"
              data-e2e="dashboard:expense-new"
              className={cn(ADD_BUTTON, 'h-11 shrink-0 px-4 max-md:hidden')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Dodaj
            </AddMenu>
          </>
        }
      />
    </div>
  );
};
