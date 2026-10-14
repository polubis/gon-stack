import type { z } from 'zod';
import { getAvatarSchema } from '@schemas/avatar';
import { API_ROUTER } from '@/shared/router/routes';
import type { Avatar } from '../domain/models';

type GetAvatarOut = z.infer<ReturnType<typeof getAvatarSchema>>['out'];

export const fetchAvatar = async (
  signal: AbortSignal,
): Promise<Avatar | null> => {
  const response = await fetch(API_ROUTER.avatar(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as GetAvatarOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data
    ? { variants: json.data.variants.map((v) => ({ ...v })) }
    : null;
};
