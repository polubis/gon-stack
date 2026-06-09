import { schema } from '@schemas/send-chat-message';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { conversations } from '../chat-store';
import { NotFound } from '../../core/error-handling';

const buildReply = (content: string): string => {
  const normalized = content.trim().toLowerCase();

  if (normalized.includes('help')) {
    return "I'm here to help. Tell me more about what you need.";
  }

  if (normalized.includes('love') || normalized.includes('partner')) {
    return 'Relationships thrive on small, consistent gestures. What would feel meaningful to you both?';
  }

  if (normalized.includes('date') || normalized.includes('plan')) {
    return 'A great plan starts with knowing what matters to your partner. What do they enjoy most?';
  }

  return "That's interesting. Tell me more and I'll help you craft the perfect response.";
};

export const sendChatMessage = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input) => {
    const { conversationId, content } = input;

    const history = conversations.get(conversationId);

    if (!history) throw new NotFound('Conversation not found.');

    const now = new Date().toISOString();

    const userMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role: 'user' as const,
      content,
      createdAt: now,
    };

    const modelMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role: 'model' as const,
      content: buildReply(content),
      createdAt: new Date().toISOString(),
    };

    history.push(userMessage, modelMessage);

    return {
      code: 200 as const,
      messages: [userMessage, modelMessage],
    };
  },
});
