import type { z } from 'zod';
import type { listTimeSchema } from '@schemas/time';
import type { InferOut } from '@/shared/server-contracts/extraction';
import {
  CATEGORY_ICON_IDS,
  type CategoryIconId,
} from '@/shared/ui/category-icon-ids';
import type {
  BacklogTask,
  Category,
  CategoryId,
  Priority,
  PriorityId,
  RecurringId,
  Task,
  TaskId,
} from '../domain/models';

type ListData = InferOut<
  z.infer<ReturnType<typeof listTimeSchema>>['out'],
  200
>['data'];

type CategoryDto = ListData['categories'][number];
type PriorityDto = ListData['priorities'][number];
type TaskDto = ListData['tasks'][number];
type BacklogDto = ListData['backlog'][number];

const FALLBACK_ICON: CategoryIconId = 'sparkles';

const toIcon = (value: string): CategoryIconId =>
  CATEGORY_ICON_IDS.find((id) => id === value) ?? FALLBACK_ICON;

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  icon: toIcon(dto.icon),
  color: dto.color,
});

export const toPriority = (dto: PriorityDto): Priority => ({
  id: dto.id as PriorityId,
  name: dto.name,
  value: dto.value,
});

export const toBacklogTask = (dto: BacklogDto): BacklogTask => ({
  id: dto.id as TaskId,
  key: dto.key,
  title: dto.title,
  description: dto.description,
  categoryId: dto.categoryId as CategoryId,
  priorityId: dto.priorityId as PriorityId,
  device: dto.device,
});

export const toTask = (dto: TaskDto): Task => ({
  id: dto.id as TaskId,
  key: dto.key,
  title: dto.title,
  description: dto.description,
  categoryId: dto.categoryId as CategoryId,
  priorityId: dto.priorityId as PriorityId,
  day: dto.day,
  at: dto.at,
  done: dto.done,
  inProgress: dto.inProgress,
  device: dto.device,
  recurringId: dto.recurringId as RecurringId | null,
});
