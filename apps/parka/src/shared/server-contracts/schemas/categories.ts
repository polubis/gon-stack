import z from 'zod';
import { category, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);

export const listCategoriesSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({ code: z.literal(200), data: z.array(category()) }),
      errorOut(),
    ]),
  });

export const createCategorySchema = () =>
  z.object({
    in: category(),
    out: z.union([
      z.object({ code: z.literal(201), data: category() }),
      errorOut(),
    ]),
  });

export const updateCategorySchema = () =>
  z.object({
    in: category(),
    out: z.union([
      z.object({ code: z.literal(200), data: category() }),
      writeErrors,
    ]),
  });

export const deleteCategorySchema = () =>
  z.object({
    in: z.object({ id: z.string().min(1) }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      writeErrors,
    ]),
  });
