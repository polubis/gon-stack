import type { UserProfile } from '../domain/models';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { Schema } from '@/shared/server-contracts/schemas/get-user-profile';

export const getUserProfile = async (
  signal: AbortSignal,
): Promise<UserProfile> => {
  const response = await fetch('/api/config/user-profile', {
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const { data } = (await response.json()) as InferOut<Schema['out'], 200>;

  return data;
};

export const logoutUser = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (response.redirected) {
    window.location.href = response.url;
    return;
  }

  if (!response.ok) {
    throw new Error('Failed to logout');
  }
};
