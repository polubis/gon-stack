import { ChatViewModel } from '../models';
import ChatModule from './chat';
import { ChatProvider } from './chat-context';

export const Chat = (props: ChatViewModel) => {
  return (
    <ChatProvider value={props}>
      <ChatModule />
    </ChatProvider>
  );
};
