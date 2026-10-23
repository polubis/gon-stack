import z from 'zod';
import { CATEGORY_ICON_IDS } from '../../ui/category-icon-ids';
import { isDay } from '../../period/period';
import { AVATAR_SIZES } from '../../avatar/domain/rules';
import { DEVICE_AVATAR_IDS } from '../../device/domain/avatars';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Per-entity shapes shared across the per-entity REST schemas. Kept as
 * factory functions so each call site gets its own zod instance rather than
 * sharing a mutated singleton.
 */

export const category = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    icon: z.string().min(1),
    color: z.string().min(1),
  });

/** Task label of the time module (own set, separate from expense categories). */
export const timeCategory = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(40),
    icon: z.string().min(1),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  });

/** Writable shape: only known icons may be stored. */
export const timeCategoryInput = () =>
  timeCategory().extend({ icon: z.enum(CATEGORY_ICON_IDS) });

/** Weight of a task: 1 (least) .. 10 (most) important. */
export const timePriority = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(40),
    value: z.number().int().min(1).max(10),
  });

export const timeTask = () =>
  z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(160),
    /** Longer notes; `null` when there are none. */
    description: z.string().trim().max(5000).nullable().default(null),
    categoryId: z.string().min(1),
    priorityId: z.string().min(1),
    day: z.string().refine(isDay, 'Invalid day'),
    /** `HH:MM`; `null` lasts the whole day. */
    at: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    done: z.boolean(),
    /** Being worked on now; never together with `done`. */
    inProgress: z.boolean().default(false),
    /** Device the task was created from; `null` for older tasks and rule occurrences. */
    device: device().nullable().default(null),
    /** Rule this task came from; `null` for an ordinary one. Server-set. */
    recurringId: z.string().min(1).nullable().default(null),
    /** Day of the rule's series this task stands for. Server-set. */
    occurrenceDate: z.string().regex(DAY).nullable().default(null),
  });

/** A task without a day: same data as a task, nothing about time. */
export const timeBacklogTask = () =>
  z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(5000).nullable().default(null),
    categoryId: z.string().min(1),
    priorityId: z.string().min(1),
    /** Device the task was created from; `null` for older tasks. */
    device: device().nullable().default(null),
  });

/** A task rule is an instruction: the server makes plain tasks from it. */
export const timeRecurring = () =>
  z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(5000).nullable().default(null),
    categoryId: z.string().min(1),
    priorityId: z.string().min(1),
    /** `HH:MM`; `null` lasts the whole day. */
    at: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    interval: recurringInterval(),
    startDate: z.string().refine(isDay, 'Invalid day'),
    endDate: z.string().refine(isDay, 'Invalid day').nullable().default(null),
    active: z.boolean().default(true),
    /** Set by the server as occurrences become tasks; input is ignored. */
    lastMaterializedDate: z.string().regex(DAY).nullable().default(null),
  });

export const receiptItem = () =>
  z.object({
    id: z.string().min(1),
    name: z.string(),
    unitPrice: z.coerce.number(),
    quantity: z.coerce.number(),
    discount: z.coerce.number(),
    categoryId: z.string().min(1),
  });

/** WebP variants of an uploaded device photo, one per size. */
export const devicePhoto = () =>
  z.object({
    variants: z.array(
      z.object({
        size: z.union(AVATAR_SIZES.map((s) => z.literal(s))),
        url: z.string().min(1),
      }),
    ),
  });

/** The device an expense was created from. */
export const device = () =>
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.enum(['mobile', 'desktop', 'tablet']),
    /** Picture the user chose for the device. Server-set, `null` for the default icon. */
    avatar: z.enum(DEVICE_AVATAR_IDS).nullable().default(null),
    /** Photo the user uploaded (WebP variants). Server-set, `null` when none. */
    photo: devicePhoto().nullable().default(null),
    /** What the browser reported; `null` when unknown. */
    model: z.string().max(64).nullable().default(null),
    os: z.string().max(32).nullable().default(null),
    browser: z.string().max(32).nullable().default(null),
    screen: z.string().max(16).nullable().default(null),
    /** Name the user gave the device. Server-set, `null` for the built name. */
    customName: z.string().max(40).nullable().default(null),
  });

export const expense = () =>
  z.object({
    id: z.string().min(1),
    merchant: z.string(),
    date: z.string().min(1),
    amount: z.coerce.number(),
    /** `null` when products from different categories make up the expense. */
    categoryId: z.string().min(1).nullable(),
    paymentMethod: z.string(),
    isBill: z.boolean(),
    source: z.enum(['receipt', 'manual']),
    /** `null` for expenses made before devices were tracked. */
    device: device().nullable().default(null),
    /** Rule this expense came from; `null` for an ordinary one. Server-set. */
    recurringId: z.string().min(1).nullable().default(null),
    /** Day of the rule's series this expense stands for. Server-set. */
    occurrenceDate: z.string().regex(DAY).nullable().default(null),
    items: z.array(receiptItem()),
  });

export const limit = () =>
  z.object({
    id: z.string().min(1),
    scope: z.enum(['total', 'category']),
    categoryId: z.string().min(1).optional(),
    amount: z.coerce.number(),
    alertAt80: z.boolean(),
    delivery: z.enum(['push', 'email']),
  });

export const recurringInterval = () => z.enum(['weekly', 'monthly', 'yearly']);

/** A rule is an instruction: it never counts into any total. */
export const recurring = () =>
  z.object({
    id: z.string().min(1),
    name: z.string(),
    cost: z.coerce.number(),
    interval: recurringInterval(),
    startDate: z.string().regex(DAY),
    endDate: z.string().regex(DAY).nullable().default(null),
    /** Set by the server as occurrences become expenses; input is ignored. */
    lastMaterializedDate: z.string().regex(DAY).nullable().default(null),
    active: z.boolean(),
    paymentMethod: z.string(),
    /** `null` when products from different categories make up the rule. */
    categoryId: z.string().min(1).nullable(),
    /** Copied into every expense the rule makes. With products `cost` is their total. */
    items: z.array(receiptItem()).default([]),
  });

export const settings = () =>
  z.object({
    profile: z.object({ name: z.string(), email: z.string() }),
    notifications: z.object({
      push: z.boolean(),
      email: z.boolean(),
      limitWarnings: z.boolean(),
      receiptConfirmations: z.boolean(),
      limitAlerts: z.boolean(),
    }),
    /** Devices of the user's expenses; only `avatar` and `customName` are writable. */
    devices: z.array(device()).max(100).default([]),
  });

export const notFoundOut = () =>
  z.object({
    code: z.literal(404),
    type: z.literal('not-found'),
    message: z.string(),
  });

export const conflictOut = () =>
  z.object({
    code: z.literal(409),
    type: z.literal('conflict'),
    message: z.string(),
  });

export const errorOut = () =>
  z.union([
    z.object({
      code: z.literal(400),
      type: z.literal('bad-request'),
      message: z.string(),
    }),
    z.object({
      code: z.literal(401),
      type: z.literal('unauthorized'),
      message: z.string(),
    }),
    z.object({
      code: z.literal(409),
      type: z.literal('conflict'),
      message: z.string(),
    }),
    z.object({
      code: z.literal(429),
      type: z.literal('too-many-requests'),
      message: z.string(),
    }),
    z.object({
      code: z.literal(500),
      type: z.literal('internal-server'),
      message: z.string(),
    }),
  ]);
