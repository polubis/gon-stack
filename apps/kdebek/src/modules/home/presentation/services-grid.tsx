import {
  Activity,
  Bone,
  HandHelping,
  HeartPulse,
  Layers,
  Monitor,
  MoveVertical,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { copy } from './copy';

const icons: Record<string, LucideIcon> = {
  'therapeutic-massage': HeartPulse,
  'classic-massage': Sparkles,
  'pain-relief': Bone,
  prevention: HandHelping,
  'sports-massage': Activity,
  'deep-tissue': Layers,
  'back-pain': MoveVertical,
  'neck-shoulders': Monitor,
};

export const ServicesGrid = () => (
  <section>
    <h2 className="font-display text-2xl font-bold text-secondary sm:text-3xl">
      {copy.servicesGrid.heading}
    </h2>

    <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 list-none p-0 sm:grid-cols-2 lg:grid-cols-4">
      {copy.servicesGrid.items.map(({ id, title, description }) => {
        const Icon = icons[id];

        return (
          <li key={id}>
            <div className="flex flex-col gap-3">
              <Icon
                className="h-9 w-9 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-secondary">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-light">
                  {description}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);
