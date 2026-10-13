import { cn } from '@repo/react-kit/cn';
import type { ComponentProps } from 'react';
import { deviceColorIndex } from '../domain/label';
import type { Device } from '../domain/models';
import { DeviceAvatar } from './device-avatar';

// Full class names so Tailwind sees them; one per colour slot.
const COLORS = [
  'bg-device-1 text-on-device-1',
  'bg-device-2 text-on-device-2',
  'bg-device-3 text-on-device-3',
  'bg-device-4 text-on-device-4',
  'bg-device-5 text-on-device-5',
  'bg-device-6 text-on-device-6',
  'bg-device-7 text-on-device-7',
  'bg-device-8 text-on-device-8',
] as const;

/**
 * Decorative round picture of a device in its own colour, so two identical
 * phones differ. Size the circle with `className`, the icon with `iconClassName`.
 */
export const DeviceBubble = ({
  device,
  iconClassName,
  className,
  ...rest
}: {
  device: Pick<Device, 'id' | 'avatar' | 'type' | 'photo'>;
  iconClassName?: string;
} & ComponentProps<'span'>) => {
  const color = deviceColorIndex(device.id);
  return (
    <span
      aria-hidden="true"
      data-device-color={color + 1}
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full',
        COLORS[color],
        className,
      )}
      {...rest}
    >
      {device.photo ? (
        <img
          data-device-photo=""
          alt=""
          src={device.photo.variants.at(-1)?.url}
          srcSet={device.photo.variants
            .map((v) => `${v.url} ${v.size}w`)
            .join(', ')}
          sizes="3rem"
          className="h-full w-full object-cover"
        />
      ) : (
        <DeviceAvatar
          avatar={device.avatar}
          type={device.type}
          className={iconClassName}
        />
      )}
    </span>
  );
};
