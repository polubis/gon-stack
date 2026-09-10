import {
  ShoppingCart,
  Car,
  ReceiptText,
  Popcorn,
  Heart,
  Dumbbell,
  Home,
  Gift,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryIconId } from '@/modules/shared/data';

const MAP: Record<CategoryIconId, LucideIcon> = {
  cart: ShoppingCart,
  car: Car,
  receipt: ReceiptText,
  popcorn: Popcorn,
  heart: Heart,
  dumbbell: Dumbbell,
  home: Home,
  gift: Gift,
  sparkles: Sparkles,
};

type Props = {
  id: CategoryIconId;
  className?: string;
};

export const CategoryIcon = ({ id, className }: Props) => {
  const Cmp = MAP[id] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
};

export const CATEGORY_ICON_OPTIONS: CategoryIconId[] = [
  'cart',
  'car',
  'receipt',
  'popcorn',
  'heart',
  'dumbbell',
  'home',
  'gift',
  'sparkles',
];
