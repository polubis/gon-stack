import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { ComponentProps } from 'react';
import type { DeviceType } from '../domain/models';

const ICONS = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
} satisfies Record<DeviceType, typeof Monitor>;

/** Decorative icon of a device type. */
export const DeviceIcon = ({
  type,
  ...rest
}: { type: DeviceType } & Omit<
  ComponentProps<typeof Monitor>,
  'aria-hidden'
>) => {
  const Icon = ICONS[type];
  return <Icon aria-hidden="true" {...rest} />;
};
