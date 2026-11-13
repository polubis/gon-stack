import type { ProductId } from '../domain/models';

const PREFIX = 'product:';

/** URL id of the popup editing product `id` (see `shared/router/modal-stack`). */
export const productModal = (id: ProductId): string => `${PREFIX}${id}`;

export const productOfModal = (modal: string): ProductId | null =>
  modal.startsWith(PREFIX) ? (modal.slice(PREFIX.length) as ProductId) : null;
