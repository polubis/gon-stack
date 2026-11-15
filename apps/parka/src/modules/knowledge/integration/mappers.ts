import { BRAIN_AREA_IDS, type BrainAreaId } from '../domain/brain-area';
import type {
  Category,
  CategoryId,
  Folder,
  FolderId,
  KnowledgeNode,
  LearnStatus,
  NodeId,
  Priority,
  PriorityId,
} from '../domain/models';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { CategoryDto, FolderDto, NodeDto, PriorityDto } from './contracts';

const STATUSES: readonly LearnStatus[] = ['to-learn', 'learning', 'learned'];

/** Unknown values from a newer backend fall back to the safest one. */
const areaOf = (value: string): BrainAreaId =>
  BRAIN_AREA_IDS.find((id) => id === value) ?? 'frontal';

const statusOf = (value: string): LearnStatus =>
  STATUSES.find((s) => s === value) ?? 'to-learn';

export const toCategory = (dto: CategoryDto): Category => ({
  ...dto,
  id: dto.id as CategoryId,
  icon: dto.icon as CategoryIconId,
});

export const toPriority = (dto: PriorityDto): Priority => ({
  ...dto,
  id: dto.id as PriorityId,
});

export const toFolder = (dto: FolderDto): Folder => ({
  id: dto.id as FolderId,
  name: dto.name,
  areaId: areaOf(dto.areaId),
});

export const toNode = (dto: NodeDto): KnowledgeNode => ({
  ...dto,
  id: dto.id as NodeId,
  folderId: dto.folderId as FolderId,
  categoryId: dto.categoryId as CategoryId,
  priorityId: dto.priorityId as PriorityId,
  status: statusOf(dto.status),
});
