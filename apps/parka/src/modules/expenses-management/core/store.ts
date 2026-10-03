import { atom } from '@repo/react-kit/supa-store';
import type {
  Category,
  Month,
  Notice,
  ScanState,
  ScannedReceipt,
} from '../domain/models';

export const createStore = () => {
  const $categories = atom<Category[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $saving = atom(false);
  /** Month of the saved expense; set once the backend accepted it. */
  const $saved = atom<Month | null>(null);
  const $scan = atom<ScanState>({ status: 'idle' });
  const $scanned = atom<ScannedReceipt | null>(null);
  const $notice = atom<Notice | null>(null);

  return {
    $categories,
    $initializing,
    $isLoading,
    $error,
    $saving,
    $saved,
    $scan,
    $scanned,
    $notice,
  };
};

export type Store = ReturnType<typeof createStore>;
