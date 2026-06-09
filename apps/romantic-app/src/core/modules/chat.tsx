import { Provider } from '@/modules/todo/presentation/context';
import { Main } from '@/modules/todo/presentation/main';

export const Module = () => {
  return (
    <Provider>
      <Main />
    </Provider>
  );
};
