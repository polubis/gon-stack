import ChatModule from './chat';
import { ChatProvider } from './chat-context';

export const Chat = () => {
  return (
    <ChatProvider>
      <ChatModule />
    </ChatProvider>
  );
};
