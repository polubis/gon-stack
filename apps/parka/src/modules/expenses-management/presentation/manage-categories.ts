import { openModal } from '@/shared/router/modal-stack';
import { CATEGORIES_LIST_MODAL } from '@/modules/categories/presentation/modal-ids';

/** Opens the categories list over the expense form. */
export const manageCategories = (): void => openModal(CATEGORIES_LIST_MODAL);
