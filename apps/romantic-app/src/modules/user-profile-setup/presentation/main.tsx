import { Provider } from './context';
import { Header } from './header';
import { Router } from './router';

const Content = () => (
  <section className="w-full max-w-2xl variant-card p-6 md:p-8 flex flex-col gap-6">
    <Header />
    <Router />
  </section>
);

export const Main = () => (
  <Provider>
    <Content />
  </Provider>
);
