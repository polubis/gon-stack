import type { z } from 'zod';
import type { getAvatarSchema } from '@schemas/avatar';
import type { getSettingsSchema } from '@schemas/settings';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { Avatar, Settings } from '../domain/models';

export type SettingsDto = InferOut<
  z.infer<ReturnType<typeof getSettingsSchema>>['out'],
  200
>['data'];

export type AvatarDto = InferOut<
  z.infer<ReturnType<typeof getAvatarSchema>>['out'],
  200
>['data'];

export const toAvatar = (dto: AvatarDto): Avatar | null =>
  dto ? { variants: dto.variants.map((v) => ({ ...v })) } : null;

export const toSettings = (dto: SettingsDto): Settings => ({
  profile: { name: dto.profile.name },
  notifications: {
    limitWarnings: dto.notifications.limitWarnings,
    receiptConfirmations: dto.notifications.receiptConfirmations,
    limitAlerts: dto.notifications.limitAlerts,
    push: dto.notifications.push,
    email: dto.notifications.email,
  },
  devices: dto.devices.map((d) => ({ ...d })),
});

export const toSettingsDto = (settings: Settings): SettingsDto => ({
  profile: { name: settings.profile.name },
  notifications: { ...settings.notifications },
  devices: settings.devices.map((d) => ({ ...d })),
});
