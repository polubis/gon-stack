import type { z } from 'zod';
import type { listMcpTokensSchema } from '@schemas/mcp-tokens';
import type { InferOut } from '@/shared/server-contracts/extraction';
import type { AccessToken, TokenId } from '../domain/models';

export type AccessTokenDto = InferOut<
  z.infer<ReturnType<typeof listMcpTokensSchema>>['out'],
  200
>['data'][number];

export const toAccessToken = (dto: AccessTokenDto): AccessToken => ({
  id: dto.id as TokenId,
  name: dto.name,
  hint: dto.hint,
  tail: dto.tail,
  status: dto.status,
  ttlDays: dto.ttlDays,
  expiresAt: dto.expiresAt,
  lastUsedAt: dto.lastUsedAt,
  rotatedAt: dto.rotatedAt,
  createdAt: dto.createdAt,
});
