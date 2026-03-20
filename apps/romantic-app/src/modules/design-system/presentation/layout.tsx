import { type ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return <div className="grid grid-cols-1 gap-6 xl:grid-cols-[30%_70%]">{children}</div>;
}
