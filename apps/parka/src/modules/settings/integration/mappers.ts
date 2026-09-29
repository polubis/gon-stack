import type { z } from 'zod';
import type { getSettingsSchema } from '@schemas/settings';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { Settings } from '../domain/models';

export type SettingsDto = InferOut<
  z.infer<ReturnType<typeof getSettingsSchema>>['out'],
  200
>['data'];

export const toSettings = (dto: SettingsDto): Settings => ({
  profile: { name: dto.profile.name, email: dto.profile.email },
  notifications: {
    limitWarnings: dto.notifications.limitWarnings,
    receiptConfirmations: dto.notifications.receiptConfirmations,
    limitAlerts: dto.notifications.limitAlerts,
    push: dto.notifications.push,
    email: dto.notifications.email,
  },
});

export const toSettingsDto = (settings: Settings): SettingsDto => ({
  profile: { name: settings.profile.name, email: settings.profile.email },
  notifications: { ...settings.notifications },
});
