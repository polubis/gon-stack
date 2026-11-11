import type { ComponentProps, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { onBackClick } from '@/shared/router/navigation';

type ScreenHeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
  title: string;
  /** Light line above the title (decorative, two-weight headline). */
  eyebrow?: string;
  backHref?: string;
  action?: ReactNode;
  titleClassName?: string;
};

export const ScreenHeader = ({
  title,
  eyebrow,
  backHref,
  action,
  titleClassName,
  ...props
}: ScreenHeaderProps) => (
  <header {...props} className="flex items-center gap-3 px-4 pb-3 pt-5">
    {backHref ? (
      <a
        href={backHref}
        onClick={onBackClick}
        aria-label="Wróć"
        className="pressable grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-ink shadow-card hover:bg-brand-softer"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      </a>
    ) : null}
    <div className="min-w-0 flex-1">
      {eyebrow ? (
        <p
          aria-hidden="true"
          className="text-2xl font-light leading-tight tracking-tight text-ink-soft lg:text-3xl"
        >
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={cn(
          'text-2xl font-semibold tracking-tight',
          eyebrow && 'text-4xl leading-none lg:text-5xl',
          titleClassName,
        )}
      >
        {title}
      </h1>
    </div>
    {action}
  </header>
);

export const Card = ({
  children,
  className,
  as: As = 'div',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li' | 'label';
} & Record<string, unknown>) => (
  <As
    className={cn(
      'rounded-3xl border border-line bg-card p-4 shadow-card',
      className,
    )}
    {...rest}
  >
    {children}
  </As>
);
