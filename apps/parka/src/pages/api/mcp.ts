import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { createSupabaseGateway } from '@/server/mcp/gateway';
import type { AttachmentImages } from '@/server/application/shared/attachment-image';
import { handleMcpRequest } from '@/server/mcp/http';

export const prerender = false;

const handle: APIRoute = ({ request }) =>
  handleMcpRequest(request, {
    gatewayFor: (token) =>
      createSupabaseGateway(token, env.IMAGES as AttachmentImages),
  });

export const POST: APIRoute = handle;
export const GET: APIRoute = handle;
export const DELETE: APIRoute = handle;
