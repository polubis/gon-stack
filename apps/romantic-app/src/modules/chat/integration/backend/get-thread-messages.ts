import type { Message, MessageRole } from '../../models'
import { mock } from './mock'

type BackendMessageDto = {
  id: string
  actor: 'assistant' | 'user' | 'system'
  content: string
}

type BackendMessagesByThreadDto = Record<string, BackendMessageDto[]>

const backendMessagesByThreadResponse: BackendMessagesByThreadDto = {
  'th-01': [
    {
      id: 'm-1',
      actor: 'assistant',
      content: "Love this. Let's build a romantic evening with one surprise moment and one grounding ritual."
    },
    {
      id: 'm-2',
      actor: 'user',
      content: 'Perfect. Keep it low budget, intimate, and no crowded places.'
    },
    {
      id: 'm-3',
      actor: 'system',
      content: 'Memory updated: prefers intimate plans, low budget, and quiet locations.'
    },
    {
      id: 'm-4',
      actor: 'assistant',
      content: 'Plan draft: sunset walk, handwritten note exchange, then homemade dessert with a shared playlist.'
    }
  ],
  'th-02': [
    {
      id: 'm-5',
      actor: 'assistant',
      content: 'Tell me your partner style and I will shortlist meaningful gifts.'
    }
  ],
  'th-03': [
    {
      id: 'm-6',
      actor: 'system',
      content: 'Travel suggestions sync in progress.'
    }
  ],
  'th-04': [
    {
      id: 'm-7',
      actor: 'system',
      content: 'Draft recovery failed. Try reconnecting and retry.'
    }
  ]
}

const toRole = (actor: BackendMessageDto['actor']): MessageRole => {
  if (actor === 'assistant') {
    return 'model'
  }
  return actor
}

const toMessage = (dto: BackendMessageDto): Message => ({
  id: dto.id,
  role: toRole(dto.actor),
  body: dto.content
})

export const getThreadMessages = async (threadId: string): Promise<Message[]> => {
  const response = await mock({ delayMs: 140 })(backendMessagesByThreadResponse[threadId] ?? [])()
  return response.map(toMessage)
}
