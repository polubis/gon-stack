import { Content } from './content';
import { Header } from './header';
import { Intro } from './intro';

export const Main = () => (
  <>
    <Header />
    <main>
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Intro />

          <div className="mt-10">
            <Content />
          </div>
        </div>
      </section>
    </main>
  </>
);
