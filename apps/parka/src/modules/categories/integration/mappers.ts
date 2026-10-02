import type { z } from 'zod';
import type { listCategoriesSchema } from '@schemas/categories';
import type { InferOut } from '@/shared/server-contracts/extraction';
import {
  CATEGORY_ICON_IDS,
  type CategoryIconId,
} from '@/shared/ui/category-icon-ids';
import { type Category, type CategoryId } from '../domain/models';

type CategoryDto = InferOut<
  z.infer<ReturnType<typeof listCategoriesSchema>>['out'],
  200
>['data'][number];

const FALLBACK_ICON: CategoryIconId = 'sparkles';

const toIcon = (value: string): CategoryIconId =>
  CATEGORY_ICON_IDS.find((id) => id === value) ?? FALLBACK_ICON;

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  icon: toIcon(dto.icon),
  color: dto.color,
});
