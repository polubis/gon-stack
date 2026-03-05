import { useContext } from './context';

import { Components } from './steps';

export const Header = () => {
  const { $step } = useContext();

  const step = $step.use();
  const totalSteps = Components.length;

  const { label } = Components[step];

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="variant-pill">Profile setup</div>
        {step > 0 && (
          <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
            Step {Math.min(step, totalSteps)} of {totalSteps}
            {label}
          </p>
        )}
      </div>
      {step > 0 && (
        <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary-400 to-secondary-400 transition-all duration-300"
            style={{
              width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%`,
            }}
          />
        </div>
      )}
    </header>
  );
};
