import { Provider } from '@/modules/quiz/presentation/context';
import { Main } from '@/modules/quiz/presentation/main';

export const Module = () => {
  return (
    <Provider>
      <Main />
    </Provider>
  );
};
