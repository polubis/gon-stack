import type { ConnectionStatus } from '../../models'
import { mock } from './mock'

type BackendConnectionStatusDto = {
  status: 'connected' | 'disconnected'
}

const backendConnectionStatusResponse: BackendConnectionStatusDto = {
  status: 'connected'
}

const toConnectionStatus = (dto: BackendConnectionStatusDto): ConnectionStatus => dto.status

export const getConnectionStatus = async (): Promise<ConnectionStatus> => {
  const response = await mock({ delayMs: 450 })(backendConnectionStatusResponse)()
  return toConnectionStatus(response)
}
