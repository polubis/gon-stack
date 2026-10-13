import { cn } from '@repo/react-kit/cn';
import {
  DEVICE_AVATARS,
  DEVICE_AVATAR_IDS,
  type DeviceAvatarId,
} from '@/shared/device/domain/avatars';
import type { Device } from '@/shared/device/domain/models';
import { DeviceAvatar } from '@/shared/device/presentation/device-avatar';
import { DeviceIcon } from '@/shared/device/presentation/device-icon';
import { Card } from '@/shared/ui/layout';

type Props = {
  devices: Device[];
  onChange: (id: Device['id'], avatar: DeviceAvatarId | null) => void;
};

const OPTION =
  'grid h-9 w-9 place-items-center rounded-full border transition-colors';

/** Pick the picture each device shows next to its expenses. */
export const DevicesCard = ({ devices, onChange }: Props) => (
  <Card
    as="section"
    className="space-y-3 lg:col-span-2"
    data-e2e="settings:devices"
  >
    <h2 className="text-sm font-semibold text-ink-soft">Urządzenia</h2>
    {devices.length === 0 ? (
      <p className="text-sm text-ink-soft">
        Urządzenia pojawią się tu po dodaniu pierwszego wydatku.
      </p>
    ) : (
      <ul className="divide-y divide-line">
        {devices.map((device) => (
          <li
            key={device.id}
            data-e2e={`settings:device:${device.id}`}
            className="space-y-2 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <DeviceAvatar
                  avatar={device.avatar}
                  type={device.type}
                  className="h-5 w-5"
                />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {device.name}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label={`Awatar urządzenia ${device.name}`}
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={device.avatar === null}
                data-e2e={`settings:device-avatar:${device.id}:default`}
                aria-label="Domyślna ikona"
                title="Domyślna ikona"
                className={cn(
                  OPTION,
                  device.avatar === null
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-line text-ink-soft hover:bg-hover-soft',
                )}
                onClick={() => onChange(device.id, null)}
              >
                <DeviceIcon type={device.type} className="h-4 w-4" />
              </button>
              {DEVICE_AVATAR_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={device.avatar === id}
                  data-e2e={`settings:device-avatar:${device.id}:${id}`}
                  aria-label={DEVICE_AVATARS[id]}
                  title={DEVICE_AVATARS[id]}
                  className={cn(
                    OPTION,
                    device.avatar === id
                      ? 'border-brand bg-brand text-on-brand'
                      : 'border-line text-ink-soft hover:bg-hover-soft',
                  )}
                  onClick={() => onChange(device.id, id)}
                >
                  <DeviceAvatar
                    avatar={id}
                    type={device.type}
                    className="h-4 w-4"
                  />
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
