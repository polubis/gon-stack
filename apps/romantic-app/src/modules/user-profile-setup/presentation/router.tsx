import { useContext } from './context';
import { Final } from './final';
import { Header } from './header';
import { Welcome } from './welcome';
import { Step } from './step';

export const Router = () => {
  const ctx = useContext();
  const isStarted = ctx.$isStarted.use();
  const isFinished = ctx.$isFinished.use();

  return !isStarted ? (
    <Welcome />
  ) : isFinished ? (
    <Final />
  ) : (
    <>
      <Header />
      <Step />
    </>
  );
};
