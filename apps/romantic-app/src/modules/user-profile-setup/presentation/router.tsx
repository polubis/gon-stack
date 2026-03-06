import { useContext } from './context';
import { Steps } from './steps';

export const Router = () => {
  const ctx = useContext();

  const step = ctx.$step.use();

  const Step = Steps[step];

  return <Step />;
};
