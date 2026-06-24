import { useEffect } from 'react';
import { Provider, useContext } from './context';
import { Router } from './router';
import { ScoreBar } from './score-bar';

const Content = () => {
  const { trigger } = useContext();

  useEffect(() => {
    trigger('[TRIGGER]_INIT');
  }, [trigger]);

  return (
    <main className="page-bg min-h-screen flex items-start justify-center p-4 md:p-8">
      <section className="w-full max-w-3xl variant-card p-6 md:p-8 flex flex-col gap-6">
        <ScoreBar />
        <Router />
      </section>
    </main>
  );
};

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
