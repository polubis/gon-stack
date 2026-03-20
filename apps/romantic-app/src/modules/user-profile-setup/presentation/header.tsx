import { memo } from 'react';
import { useContext } from './context';

export const Header = memo(
  () => {
    const ctx = useContext();
    const activeStepIndex = ctx.$activeStepIndex.use();
    const totalSteps = ctx.$totalSteps.use();
    const activeStep = ctx.$activeStep.use();
    const progressPercentage = ctx.$progressPercentage.use();

    return (
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="variant-pill">PROFILE SETUP</div>
          <p className="l1">
            Step {activeStepIndex + 1} of {totalSteps} - {activeStep.label}
          </p>
        </div>
        <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </header>
    );
  },
  () => true,
);

Header.displayName = 'Header';

