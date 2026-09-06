import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, Lock, X } from 'lucide-react';
import { categoryOrder } from '../core/consent';
import type { ConsentCategoryId, ConsentPreferences } from '../domain/models';
import { categoryIcon } from './category-icon';
import { copy } from './copy';

type Props = {
  open: boolean;
  preferences: ConsentPreferences;
  onOpenChange: (open: boolean) => void;
  onToggleCategory: (id: ConsentCategoryId) => void;
  onRejectOptional: () => void;
  onSavePreferences: () => void;
  onAcceptAll: () => void;
};

export const PreferencesDialog = ({
  open,
  preferences,
  onOpenChange,
  onToggleCategory,
  onRejectOptional,
  onSavePreferences,
  onAcceptAll,
}: Props) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
      <Dialog.Content
        data-e2e="cookies:preferences"
        className="fixed inset-0 z-50 flex flex-col bg-slate-900 focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-slate-800 sm:shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Dialog.Close
              aria-label={copy.preferences.backLabel}
              data-e2e="cookies:back"
              className="-ml-1 rounded-full p-1 text-white sm:hidden"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
            <Dialog.Title className="text-lg font-semibold text-white sm:text-xl">
              {copy.preferences.title}
            </Dialog.Title>
          </div>
          <Dialog.Close
            aria-label={copy.preferences.closeLabel}
            data-e2e="cookies:close"
            className="hidden rounded-full p-1 text-slate-400 hover:text-white sm:block"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Dialog.Close>
        </div>

        <Dialog.Description className="px-5 pt-4 text-sm leading-relaxed text-slate-400 sm:px-6">
          {copy.preferences.description}
        </Dialog.Description>

        <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-6">
          {categoryOrder.map((id) => {
            const category = copy.preferences.categories[id];
            const Icon = categoryIcon[id];
            const isEssential = id === 'essential';
            const checked = preferences[id];

            return (
              <div
                key={id}
                className="flex items-start justify-between gap-4 border-b border-slate-800 py-4 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isEssential
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{category.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                {isEssential ? (
                  <div className="flex shrink-0 items-center gap-2 pt-1 text-xs font-semibold text-emerald-400">
                    <span>{copy.preferences.alwaysActive}</span>
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={category.title}
                    onClick={() => onToggleCategory(id)}
                    data-category={id}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      checked ? 'bg-orange-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        checked ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onRejectOptional}
            data-e2e="cookies:reject-optional"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {copy.preferences.rejectOptional}
          </button>
          <button
            type="button"
            onClick={onSavePreferences}
            data-e2e="cookies:save-preferences"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 sm:border sm:border-orange-500 sm:bg-transparent sm:text-orange-400 sm:hover:bg-orange-500/10"
          >
            {copy.preferences.savePreferences}
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            data-e2e="cookies:accept-all"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            {copy.preferences.acceptAll}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
