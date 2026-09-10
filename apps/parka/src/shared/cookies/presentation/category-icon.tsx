import { BarChart3, Megaphone, ShieldCheck, User } from 'lucide-react';
import type { ComponentType } from 'react';
import type { ConsentCategoryId } from '../domain/models';

export const categoryIcon: Record<
  ConsentCategoryId,
  ComponentType<{ className?: string }>
> = {
  essential: ShieldCheck,
  analytics: BarChart3,
  personalization: User,
  marketing: Megaphone,
};
