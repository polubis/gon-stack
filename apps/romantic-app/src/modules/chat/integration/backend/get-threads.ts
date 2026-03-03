import type { Thread, ThreadState } from '../../models'
import { mock } from './mock'

type BackendThreadDto = {
  thread_id: string
  title: string
  last_preview: string
  relative_time_label: string
  unread_count: number
  is_active: boolean
  sync_state: 'active' | 'idle' | 'loading' | 'error'
}

const backendThreadsResponse: BackendThreadDto[] = [
  {
    thread_id: 'th-01',
    title: 'Date Night Brainstorm',
    last_preview: 'Can you suggest cozy ideas for Friday?',
    relative_time_label: '2m ago',
    unread_count: 2,
    is_active: true,
    sync_state: 'active'
  },
  {
    thread_id: 'th-02',
    title: 'Gift Ideas',
    last_preview: 'Something meaningful under $50',
    relative_time_label: '12m ago',
    unread_count: 0,
    is_active: false,
    sync_state: 'idle'
  },
  {
    thread_id: 'th-03',
    title: 'Weekend Escape',
    last_preview: 'Looking for a calm place nearby',
    relative_time_label: '41m ago',
    unread_count: 0,
    is_active: false,
    sync_state: 'loading'
  },
  {
    thread_id: 'th-04',
    title: 'Anniversary Note',
    last_preview: 'Make it warm but not cheesy',
    relative_time_label: 'Yesterday',
    unread_count: 0,
    is_active: false,
    sync_state: 'error'
  }
]

const toThread = (dto: BackendThreadDto): Thread => ({
  id: dto.thread_id,
  title: dto.title,
  preview: dto.last_preview,
  time: dto.relative_time_label,
  unread: dto.unread_count,
  active: dto.is_active,
  state: dto.sync_state as ThreadState
})

export const getThreads = async (): Promise<Thread[]> => {
  const response = await mock({ delayMs: 120 })(backendThreadsResponse)()
  return response.map(toThread)
}
