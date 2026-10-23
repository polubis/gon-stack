import type { z } from 'zod';
import {
  createMcpTokenSchema,
  deleteMcpTokenSchema,
  listMcpTokensSchema,
  revokeMcpTokenSchema,
  rotateMcpTokenSchema,
} from '@schemas/mcp-tokens';
import { API_ROUTER } from '@/shared/router/routes';
import type { AccessToken, TokenId } from '../domain/models';
import { toAccessToken } from './mappers';

type ListOut = z.infer<ReturnType<typeof listMcpTokensSchema>>['out'];
type CreateOut = z.infer<ReturnType<typeof createMcpTokenSchema>>['out'];
type RotateOut = z.infer<ReturnType<typeof rotateMcpTokenSchema>>['out'];
type RevokeOut = z.infer<ReturnType<typeof revokeMcpTokenSchema>>['out'];
type DeleteOut = z.infer<ReturnType<typeof deleteMcpTokenSchema>>['out'];

/** Astro treats a body-less write as a form post: always send JSON. */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** Nothing else in this module fetches. */
export const fetchTokens = async (
  signal: AbortSignal,
): Promise<AccessToken[]> => {
  const response = await fetch(API_ROUTER.mcpTokens(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as ListOut;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.map(toAccessToken);
};

/** The secret in the answer is the only copy there will ever be. */
export const postToken = async (
  name: string,
  ttlDays: number | null,
): Promise<{ token: string; item: AccessToken }> => {
  const response = await fetch(API_ROUTER.mcpTokens(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, ttlDays }),
  });
  const json = (await response.json()) as CreateOut;
  if (json.code !== 201) throw new Error(json.message);
  return { token: json.data.token, item: toAccessToken(json.data.item) };
};

export const postRotation = async (
  id: TokenId,
): Promise<{ token: string; item: AccessToken }> => {
  const response = await fetch(API_ROUTER.mcpTokenRotate(id), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: '{}',
  });
  const json = (await response.json()) as RotateOut;
  if (json.code !== 200) throw new Error(json.message);
  return { token: json.data.token, item: toAccessToken(json.data.item) };
};

export const postRevocation = async (id: TokenId): Promise<AccessToken> => {
  const response = await fetch(API_ROUTER.mcpTokenRevoke(id), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: '{}',
  });
  const json = (await response.json()) as RevokeOut;
  if (json.code !== 200) throw new Error(json.message);
  return toAccessToken(json.data);
};

export const deleteToken = async (id: TokenId): Promise<void> => {
  const response = await fetch(API_ROUTER.mcpTokenById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as DeleteOut;
  if (json.code !== 200) throw new Error(json.message);
};
