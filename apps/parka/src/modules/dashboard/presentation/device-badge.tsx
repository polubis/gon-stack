import { deviceLabel, deviceShortId } from '@/shared/device/domain/label';
import type { Device } from '@/shared/device/domain/models';
import { DeviceBubble } from '@/shared/device/presentation/device-bubble';

/**
 * Where an expense was created, on one line of a list row. Narrow screens
 * keep the colored picture only (the label stays available to screen
 * readers); the full details are in the expense popup.
 */
export const DeviceBadge = ({ device }: { device: Device }) => (
  <span className="flex min-w-0 items-center gap-1">
    <DeviceBubble device={device} className="h-5 w-5" iconClassName="h-3 w-3" />
    <span className="truncate max-sm:sr-only">{deviceLabel(device)}</span>
    <span className="shrink-0 text-caption text-ink-soft max-sm:sr-only">
      {deviceShortId(device.id)}
    </span>
  </span>
);
