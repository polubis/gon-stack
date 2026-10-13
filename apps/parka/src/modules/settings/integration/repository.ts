import type { z } from 'zod';
import { getAvatarSchema, uploadAvatarSchema } from '@schemas/avatar';
import { getSettingsSchema, updateSettingsSchema } from '@schemas/settings';
import { API_ROUTER } from '@/shared/router/routes';
import type { Avatar, Settings } from '../domain/models';
import { toAvatar, toSettings, toSettingsDto } from './mappers';

type GetSettingsOut = z.infer<ReturnType<typeof getSettingsSchema>>['out'];
type UpdateSettingsOut = z.infer<
  ReturnType<typeof updateSettingsSchema>
>['out'];

/** Nothing else in this module fetches. */
export const fetchSettings = async (signal: AbortSignal): Promise<Settings> => {
  const response = await fetch(API_ROUTER.settings(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as GetSettingsOut;
  if (json.code !== 200) throw new Error(json.message);
  return toSettings(json.data);
};

export const putSettings = async (settings: Settings): Promise<Settings> => {
  const response = await fetch(API_ROUTER.settings(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSettingsDto(settings)),
  });
  const json = (await response.json()) as UpdateSettingsOut;
  if (json.code !== 200) throw new Error(json.message);
  return toSettings(json.data);
};

type GetAvatarOut = z.infer<ReturnType<typeof getAvatarSchema>>['out'];
type UploadAvatarOut = z.infer<ReturnType<typeof uploadAvatarSchema>>['out'];

export const fetchAvatar = async (
  signal: AbortSignal,
): Promise<Avatar | null> => {
  const response = await fetch(API_ROUTER.avatar(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as GetAvatarOut;
  if (json.code !== 200) throw new Error(json.message);
  return toAvatar(json.data);
};

export const postAvatar = async (file: File): Promise<Avatar | null> => {
  const body = new FormData();
  body.set('file', file);
  const response = await fetch(API_ROUTER.avatar(), { method: 'POST', body });
  const json = (await response.json()) as UploadAvatarOut;
  if (json.code !== 200) throw new Error(json.message);
  return toAvatar(json.data);
};

export const logout = async (): Promise<void> => {
  await fetch(API_ROUTER.authLogout(), {
    method: 'POST',
    redirect: 'manual',
  });
};
