import { atom } from '@/libs/supa-store';
import type { Coordinates, GeoStatus } from '../contracts/models';

export const createStore = () => {
  const $coordinates = atom<Coordinates | null>(null);
  const $geoStatus = atom<GeoStatus>('idle');
  const $keywords = atom<string[]>([]);
  const $keywordInput = atom('');
  const $aiSuggestions = atom<string[]>([]);
  const $isSuggesting = atom(false);
  const $isSubmitting = atom(false);
  const $submitError = atom<string | null>(null);
  const $submitSuccess = atom<string | null>(null);

  return {
    $coordinates,
    $geoStatus,
    $keywords,
    $keywordInput,
    $aiSuggestions,
    $isSuggesting,
    $isSubmitting,
    $submitError,
    $submitSuccess,
  };
};

export type Store = ReturnType<typeof createStore>;
