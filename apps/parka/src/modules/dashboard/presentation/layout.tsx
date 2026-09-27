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
      'rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(16,36,27,0.04)]',
      className,
    )}
  >
    {children}
  </div>
);
