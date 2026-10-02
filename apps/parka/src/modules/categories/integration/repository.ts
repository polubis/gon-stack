import type { z } from 'zod';
import {
  createCategorySchema,
  listCategoriesSchema,
  updateCategorySchema,
} from '@schemas/categories';
import { API_ROUTER } from '@/shared/router/routes';
import type { Category } from '../domain/models';
import { toCategory } from './mappers';

type ListOut = z.infer<ReturnType<typeof listCategoriesSchema>>['out'];
type CreateOut = z.infer<ReturnType<typeof createCategorySchema>>['out'];
type UpdateOut = z.infer<ReturnType<typeof updateCategorySchema>>['out'];

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Nothing else in this module fetches. */
export const fetchCategories = async (
  signal: AbortSignal,
): Promise<Category[]> => {
  const response = await fetch(API_ROUTER.categories(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toCategory);
};

export const postCategory = async (category: Category): Promise<Category> => {
  const response = await fetch(API_ROUTER.categories(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(category),
  });
  const json = (await response.json()) as CreateOut;
  if (json.code !== 201) throw new Error(json.message);
  return toCategory(json.data);
};

export const putCategory = async (category: Category): Promise<Category> => {
  const response = await fetch(API_ROUTER.categoryById(category.id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(category),
  });
  const json = (await response.json()) as UpdateOut;
  if (json.code !== 200) throw new Error(json.message);
  return toCategory(json.data);
};
