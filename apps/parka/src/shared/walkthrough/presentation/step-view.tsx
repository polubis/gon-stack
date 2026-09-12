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
      <span className="mb-8 grid h-20 w-20 place-items-center rounded-3xl bg-brand-soft text-brand">
        <Icon className="h-10 w-10" aria-hidden={true} />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{step.title}</h1>
      <p className="mt-3 max-w-xs text-ink-soft">{step.body}</p>
    </>
  );
};
