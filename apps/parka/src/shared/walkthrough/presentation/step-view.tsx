import { useContext } from './context';

export const StepView = () => {
  const ctx = useContext();
  const step = ctx.useActiveStep();

  if (!step) {
    return null;
  }

  const Icon = step.icon;

  return (
    <>
      <span className="mb-8 grid h-20 w-20 place-items-center rounded-3xl lg:mb-10 lg:h-28 lg:w-28 bg-brand-soft text-brand">
        <Icon className="h-10 w-10 lg:h-14 lg:w-14" aria-hidden={true} />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
        {step.title}
      </h1>
      <p className="mt-3 max-w-xs text-ink-soft md:max-w-md md:text-lg lg:mt-4 lg:max-w-xl lg:text-xl">
        {step.body}
      </p>
    </>
  );
};
