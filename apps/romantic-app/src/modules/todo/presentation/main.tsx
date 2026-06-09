import { useEffect } from 'react';
import { useContext } from './context';
import { Chat } from './chat';

export const Main = () => {
  const ctx = useContext();

  useEffect(() => {
    ctx.bootstrap();
  }, [ctx]);

  return <Chat />;
};
