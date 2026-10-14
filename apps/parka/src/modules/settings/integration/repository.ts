import type { z } from 'zod';
import {
  getAvatarSchema,
  uploadAvatarSchema,
  uploadDevicePhotoSchema,
} from '@schemas/avatar';
import { getSettingsSchema, updateSettingsSchema } from '@schemas/settings';
import { subscribePushSchema } from '@schemas/push';
import { API_ROUTER } from '@/shared/router/routes';
import type { DevicePhoto } from '@/shared/device/domain/models';
import type { Avatar, Settings } from '../domain/models';
import { toAvatar, toSettings, toSettingsDto } from './mappers';
import type { PushSubscriptionDto } from './push';

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

type UploadDevicePhotoOut = z.infer<
  ReturnType<typeof uploadDevicePhotoSchema>
>['out'];

export const postDevicePhoto = async (
  deviceId: string,
  file: File,
): Promise<DevicePhoto> => {
  const body = new FormData();
  body.set('deviceId', deviceId);
  body.set('file', file);
  const response = await fetch(API_ROUTER.devicePhoto(), {
    method: 'POST',
    body,
  });
  const json = (await response.json()) as UploadDevicePhotoOut;
  if (json.code !== 200) throw new Error(json.message);
  return { variants: json.data.variants.map((v) => ({ ...v })) };
};

type SubscribePushOut = z.infer<ReturnType<typeof subscribePushSchema>>['out'];

export const putPushSubscription = async (
  subscription: PushSubscriptionDto,
): Promise<void> => {
  const response = await fetch(API_ROUTER.push(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
  const json = (await response.json()) as SubscribePushOut;
  if (json.code !== 200) throw new Error(json.message);
};
