import z from 'zod';
import { settings, errorOut } from './general';

export const getSettingsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: settings() }),
      errorOut(),
    ]),
  });

export const updateSettingsSchema = () =>
  z.object({
    in: settings(),
    out: z.union([
      z.object({ code: z.literal(200), data: settings() }),
      errorOut(),
    ]),
  });
