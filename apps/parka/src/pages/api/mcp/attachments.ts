import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { createSupabaseGateway } from '@/server/mcp/gateway';
import type { AttachmentImages } from '@/server/application/shared/attachment-image';
import { handleMcpUpload } from '@/server/mcp/http';

export const prerender = false;

export const POST: APIRoute = ({ request }) =>
  handleMcpUpload(request, {
    gatewayFor: (token) =>
      createSupabaseGateway(token, env.IMAGES as AttachmentImages),
  });
