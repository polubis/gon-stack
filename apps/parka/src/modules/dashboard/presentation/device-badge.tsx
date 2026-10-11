import { DeviceIcon } from '@/shared/device/presentation/device-icon';
import type { Device } from '@/shared/device/domain/models';

/**
 * Where an expense was created, on one line of a list row. Narrow screens
 * keep the icon only (the name stays available to screen readers); the full
 * name and id are in the expense popup.
 */
export const DeviceBadge = ({ device }: { device: Device }) => (
  <span className="flex min-w-0 items-center gap-1">
    <DeviceIcon type={device.type} className="h-3.5 w-3.5 shrink-0" />
    <span className="truncate max-sm:sr-only">{device.name}</span>
  </span>
);
