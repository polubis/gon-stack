import z from 'zod';
import { AVATAR_SIZES } from '../../avatar/domain/rules';
import { validateAvatarFile } from '../../avatar/domain/validate-avatar-file';
import { devicePhoto, errorOut } from './general';

const avatarFile = () =>
  z.instanceof(File).superRefine(async (file, ctx) => {
    const reason = await validateAvatarFile(file);
    if (reason) ctx.addIssue({ code: 'custom', message: reason });
  });

/** WebP variants of the user's picture, one per size. */
export const avatar = () =>
  z.object({
    variants: z.array(
      z.object({
        size: z.union(AVATAR_SIZES.map((s) => z.literal(s))),
        url: z.string().min(1),
      }),
    ),
  });

export const getAvatarSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: avatar().nullable() }),
      errorOut(),
    ]),
  });

export const uploadAvatarSchema = () =>
  z.object({
    in: z.object({ file: avatarFile() }),
    out: z.union([
      z.object({ code: z.literal(200), data: avatar() }),
      errorOut(),
    ]),
  });

/** Id of a device as the browser mints it; safe inside a storage path. */
const deviceId = () => z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

export const uploadDevicePhotoSchema = () =>
  z.object({
    in: z.object({ deviceId: deviceId(), file: avatarFile() }),
    out: z.union([
      z.object({ code: z.literal(200), data: devicePhoto() }),
      errorOut(),
    ]),
  });
