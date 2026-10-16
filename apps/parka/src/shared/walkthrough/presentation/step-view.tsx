import { useContext } from './context';

export const StepView = () => {
  const ctx = useContext();
  const step = ctx.useActiveStep();

  if (!step) {
    return null;
  }

  const Illustration = step.illustration;

  // Keyed by step: each step enters as a whole, the frame never resizes.
  return (
    <div aria-live="polite" className="w-full">
      <div
        key={step.id}
        className="flex w-full animate-view-enter flex-col items-center motion-reduce:animate-none"
      >
        <div aria-hidden="true" className="w-full">
          <Illustration />
        </div>
        {/* Two-line slots: a short step never shrinks the frame (no jump). */}
        <h2 className="mt-6 flex min-h-[2lh] items-center justify-center text-xl font-semibold tracking-tight md:text-2xl">
          {step.title}
        </h2>
        <p className="mt-2 min-h-[2lh] max-w-sm text-sm text-ink-soft md:text-base">
          {step.body}
        </p>
      </div>
    </div>
  );
};
