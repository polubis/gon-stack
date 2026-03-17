import { useEffect } from 'react';
import { Provider, useContext } from './context';
import { Router } from './router';

const Content = () => {
  const ctx = useContext();
  const { trigger } = ctx;

  useEffect(() => {
    trigger('[TRIGGER]_INIT');
  }, [trigger]);

  return (
    <section className="w-full max-w-2xl variant-card p-6 md:p-8 flex flex-col gap-6">
      <Router />
    </section>
  );
};

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
