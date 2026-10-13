import {
  Bird,
  Cat,
  Coffee,
  Dog,
  Fish,
  Gamepad2,
  Heart,
  Music,
  Rabbit,
  Rocket,
  Star,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import type { DeviceAvatarId } from '../domain/avatars';
import type { DeviceType } from '../domain/models';
import { DeviceIcon } from './device-icon';

const ICONS = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  coffee: Coffee,
  gamepad: Gamepad2,
  music: Music,
  sun: Sun,
} satisfies Record<DeviceAvatarId, LucideIcon>;

/** Decorative picture of a device: its chosen avatar, else its type icon. */
export const DeviceAvatar = ({
  avatar,
  type,
  ...rest
}: { avatar: DeviceAvatarId | null; type: DeviceType } & Omit<
  ComponentProps<typeof DeviceIcon>,
  'type'
>) => {
  if (!avatar) return <DeviceIcon type={type} {...rest} />;
  const Icon = ICONS[avatar];
  return <Icon aria-hidden="true" data-avatar={avatar} {...rest} />;
};
