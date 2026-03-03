import { mock } from './mock'

type RequestAssistantReplyPayload = {
  threadId: string
  body: string
}

type BackendAssistantReplyRequestDto = {
  thread_id: string
  prompt: string
}

type BackendAssistantReplyResponseDto = {
  message: string
}

const buildReply = (prompt: string): string => {
  const normalized = prompt.trim().toLowerCase()

  if (normalized.includes('budget')) {
    return 'Budget-friendly plan: sunset walk, playlist exchange, and homemade dessert with a handwritten note.'
  }

  if (normalized.includes('gift')) {
    return 'Gift direction: choose one practical daily-use item plus one memory token tied to a shared moment.'
  }

  return 'Great direction. I can turn this into a step-by-step plan with timings, mood cues, and a backup option.'
}

const toBackendRequest = (payload: RequestAssistantReplyPayload): BackendAssistantReplyRequestDto => ({
  thread_id: payload.threadId,
  prompt: payload.body
})

export const postAssistantReply = async (payload: RequestAssistantReplyPayload): Promise<string> => {
  const request = toBackendRequest(payload)

  const response = await mock({ delayMs: 850, errorFactor: 4 })<BackendAssistantReplyResponseDto>({
    message: buildReply(request.prompt)
  })(request)

  return response.message
}
