import {
  deviceDetailsLine,
  deviceLabel,
  deviceShortId,
} from '@/shared/device/domain/label';
import type { Device } from '@/shared/device/domain/models';
import { DeviceBubble } from '@/shared/device/presentation/device-bubble';

/** Where a task was created, one line in the row's "more" popover. */
export const TaskDeviceBadge = ({ device }: { device: Device }) => (
  <span
    className="flex min-w-0 shrink items-center gap-1 text-xs text-ink-soft"
    data-e2e="time:task-row-device"
  >
    <DeviceBubble device={device} className="h-5 w-5" iconClassName="h-3 w-3" />
    <span className="truncate">{deviceLabel(device)}</span>
    <span className="shrink-0">{deviceShortId(device.id)}</span>
  </span>
);

/** Device block of the task popup: name, what the browser reported, id. */
export const TaskDeviceDetail = ({ device }: { device: Device }) => (
  <div
    className="flex items-center gap-2 rounded-xl border border-line p-3 text-sm"
    data-e2e="time:task-device"
  >
    <DeviceBubble device={device} className="h-8 w-8" iconClassName="h-4 w-4" />
    <div className="min-w-0">
      <p className="font-medium">
        <span className="sr-only">Urządzenie: </span>
        {deviceLabel(device)}
      </p>
      {deviceDetailsLine(device) ? (
        <p className="text-xs text-ink-soft">{deviceDetailsLine(device)}</p>
      ) : null}
      <p className="font-mono text-xs break-all text-ink-soft">{device.id}</p>
    </div>
  </div>
);
