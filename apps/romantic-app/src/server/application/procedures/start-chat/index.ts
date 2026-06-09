import { schema } from '@schemas/start-chat';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { conversations } from '../chat-store';

export const startChat = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async () => {
    const conversationId = crypto.randomUUID();

    conversations.set(conversationId, []);

    return {
      code: 200 as const,
      conversationId,
    };
  },
});
