import type { ActiveThreadHeader } from '../../models'
import { mock } from './mock'

type BackendActiveThreadHeaderDto = {
  thread_title: string
  model_name: string
  context_health: string
}

const backendHeaderByThreadResponse: Record<string, BackendActiveThreadHeaderDto> = {
  'th-01': {
    thread_title: 'Date Night Brainstorm',
    model_name: 'Amoria-4.1',
    context_health: 'Context window healthy'
  },
  'th-02': {
    thread_title: 'Gift Ideas',
    model_name: 'Amoria-4.1',
    context_health: 'Context window healthy'
  },
  'th-03': {
    thread_title: 'Weekend Escape',
    model_name: 'Amoria-4.1',
    context_health: 'Context syncing in progress'
  },
  'th-04': {
    thread_title: 'Anniversary Note',
    model_name: 'Amoria-4.1',
    context_health: 'Context unavailable'
  }
}

const fallbackHeaderDto: BackendActiveThreadHeaderDto = {
  thread_title: 'New Chat',
  model_name: 'Amoria-4.1',
  context_health: 'Context window healthy'
}

const toHeader = (dto: BackendActiveThreadHeaderDto): ActiveThreadHeader => ({
  title: dto.thread_title,
  modelLabel: dto.model_name,
  contextStatus: dto.context_health
})

export const getActiveThreadHeader = async (threadId: string): Promise<ActiveThreadHeader> => {
  const response = await mock({ delayMs: 90 })(backendHeaderByThreadResponse[threadId] ?? fallbackHeaderDto)()
  return toHeader(response)
}
