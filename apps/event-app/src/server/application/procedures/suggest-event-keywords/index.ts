import Anthropic from '@anthropic-ai/sdk';
import { schema } from '@schemas/suggest-event-keywords';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const suggestEventKeywords = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input) => {
    const client = new Anthropic({
      apiKey: import.meta.env.ANTHROPIC_API_KEY,
    });

    const contextLines = [
      `Event Name: ${input.name}`,
      input.description ? `Description: ${input.description}` : null,
      input.category ? `Category: ${input.category}` : null,
    ].filter(Boolean) as string[];

    let message: Anthropic.Message;
    try {
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Generate 5-10 relevant search keywords for the following event. Return only a JSON array of keyword strings, nothing else.\n\n${contextLines.join('\n')}`,
          },
        ],
      });
    } catch {
      throw new InternalServer('Keyword suggestion service unavailable');
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    let keywords: string[];
    try {
      const match = text.match(/\[[\s\S]*\]/);
      const parsed: unknown = match ? JSON.parse(match[0]) : [];
      keywords = Array.isArray(parsed)
        ? parsed.filter((k): k is string => typeof k === 'string')
        : [];
    } catch {
      throw new InternalServer('Failed to parse keyword suggestions');
    }

    return {
      code: 200 as const,
      keywords,
    };
  },
});
