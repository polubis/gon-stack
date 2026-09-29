import type { ReactNode } from 'react';
import { cn } from '@repo/react-kit/cn';

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-2xl border border-line bg-card p-4 shadow-card',
      className,
    )}
  >
    {children}
  </div>
);
