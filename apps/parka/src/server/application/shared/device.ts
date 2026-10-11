import type { z } from 'zod';
import type { device } from '@schemas/general';

type Device = z.infer<ReturnType<typeof device>>;

type DeviceColumns = {
  device_id: string | null;
  device_name: string | null;
  device_type: string | null;
};

export const deviceColumns = (value: Device | null): DeviceColumns => ({
  device_id: value?.id ?? null,
  device_name: value?.name ?? null,
  device_type: value?.type ?? null,
});

export const toDevice = (row: DeviceColumns): Device | null =>
  row.device_id && row.device_name && isDeviceType(row.device_type)
    ? { id: row.device_id, name: row.device_name, type: row.device_type }
    : null;

const isDeviceType = (value: string | null): value is Device['type'] =>
  value === 'mobile' || value === 'desktop' || value === 'tablet';
