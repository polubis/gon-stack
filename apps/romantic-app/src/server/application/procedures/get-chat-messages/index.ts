import { schema } from '@schemas/get-chat-messages';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { conversations } from '../chat-store';
import { NotFound } from '../../core/error-handling';

export const getChatMessages = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input) => {
    const { conversationId } = input;

    const history = conversations.get(conversationId);

    if (!history) throw new NotFound('Conversation not found.');

    return {
      code: 200 as const,
      messages: history,
    };
  },
});
