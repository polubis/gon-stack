import { createHookContext } from '../../../libs/power-context';
import type { ChatViewModel } from '../models';

export const [ChatProvider, useChatContext, ChatContext] = createHookContext(
  'Chat',
  (props: ChatViewModel) => props,
);
