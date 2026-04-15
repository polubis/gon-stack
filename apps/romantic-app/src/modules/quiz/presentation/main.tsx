import { useEffect } from 'react';
import { useContext } from './context';
import { Router } from './router';

export const Main = () => {
  const ctx = useContext();

  useEffect(() => {
    ctx.init();
  }, [ctx]);

  return (
    <main className="page-bg min-h-screen flex items-center justify-center p-4 md:p-8">
      <section className="w-full max-w-3xl variant-card p-6 md:p-8 flex flex-col gap-6">
        <Router />
      </section>
    </main>
  );
};
