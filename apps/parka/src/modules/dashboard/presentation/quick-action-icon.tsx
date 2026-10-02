import { Plus, Camera, Target, type LucideIcon } from 'lucide-react';
import type { QuickActionIconId } from '../domain/models';

const MAP: Record<QuickActionIconId, LucideIcon> = {
  add: Plus,
  camera: Camera,
  target: Target,
};

type Props = {
  id: QuickActionIconId;
  className?: string;
};

export const QuickActionIcon = ({ id, className }: Props) => {
  const Cmp = MAP[id];
  return <Cmp className={className} aria-hidden="true" />;
};
