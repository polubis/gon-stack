import { type ReactNode } from 'react';

import { Card } from '../../../../libs/ui/card';

export type ExampleProps = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

function ExampleRoot({
  id,
  title,
  description,
  children,
  className,
}: ExampleProps) {
  return (
    <div
      id={id}
      className={['w-full max-w-6xl space-y-6', className].filter(Boolean).join(' ')}
    >
      <div className="text-center space-y-2">
        {description ? <p className="v1">{description}</p> : null}
        {/* Demo root title: page already has h1, so we use h2 here. */}
        <h2 className="t2">{title}</h2>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

export type ExampleCaseProps = {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

function Case({ id, title, description, children }: ExampleCaseProps) {
  return (
    <Card
      id={id}
      className="variant-card scroll-mt-24 rounded-xl p-5 md:p-6"
    >
      {title ? (
        <header className="mb-4 space-y-1">
          {/* Demo root uses h2, so each case title is h3. */}
          <h3 className="t3">{title}</h3>
          {description ? <p className="b2">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </Card>
  );
}

export const Example = Object.assign(ExampleRoot, { Case }) as typeof ExampleRoot & {
  Case: typeof Case;
};

