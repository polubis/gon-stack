import type { ThreadsSummary } from '../../models'
import { mock } from './mock'

type BackendThreadsSummaryDto = {
  total_threads: number
}

const backendThreadsSummaryResponse: BackendThreadsSummaryDto = {
  total_threads: 12
}

const toThreadsSummary = (dto: BackendThreadsSummaryDto): ThreadsSummary => ({
  total: dto.total_threads
})

export const getThreadsSummary = async (): Promise<ThreadsSummary> => {
  const response = await mock({ delayMs: 100 })(backendThreadsSummaryResponse)()
  return toThreadsSummary(response)
}
