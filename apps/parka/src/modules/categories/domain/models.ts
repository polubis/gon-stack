import type { Brand } from '@repo/type-beast/brand';

export type CategoryId = Brand<string, 'CategoryId'>;

import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Category = {
  id: CategoryId;
  /** Default categories store a `category.<slug>` symbol; user-made ones a plain name. */
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;
