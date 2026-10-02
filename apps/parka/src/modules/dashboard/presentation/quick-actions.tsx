import { Card } from '@/shared/ui/layout';
import { QUICK_ACTIONS } from '../configuration/constraints';
import { focusSection } from './focus-section';
import { QuickActionIcon } from './quick-action-icon';

export const QuickActions = () => (
  <Card as="section" aria-labelledby="quick-actions" className="space-y-3">
    <h2 id="quick-actions" className="text-base font-semibold">
      Szybkie akcje
    </h2>
    <ul className="grid grid-cols-4 gap-2 md:gap-3 xl:grid-cols-2">
      {QUICK_ACTIONS.map(({ label, href, iconId }) => (
        <li key={label}>
          <a
            href={href}
            onClick={href.startsWith('#') ? focusSection : undefined}
            className="flex h-full flex-col items-center gap-1.5 rounded-xl bg-brand-softer p-2 text-center text-caption font-medium text-ink-soft hover:bg-brand-soft md:text-xs xl:py-4"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full text-brand">
              <QuickActionIcon id={iconId} className="h-5 w-5" />
            </span>
            {label}
          </a>
        </li>
      ))}
    </ul>
  </Card>
);
