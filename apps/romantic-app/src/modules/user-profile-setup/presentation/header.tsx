import { memo } from 'react';
import { useContext } from './context';

import { Steps } from './steps';

const totalSteps = Steps.length;

export const Header = memo(
  () => {
    const ctx = useContext();

    const step = ctx.$step.use();

    const { label } = Steps[step];

    return (
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="variant-pill">PROFILE SETUP</div>
          <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
            Step {Math.min(step, totalSteps)} of {totalSteps}
            {` - ${label}`}
          </p>
        </div>
        <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
            style={{
              width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </header>
    );
  },
  () => true,
);
