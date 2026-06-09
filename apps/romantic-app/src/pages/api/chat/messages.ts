import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { sendChatMessage } from '@/server/application/procedures/send-chat-message';
import { getChatMessages } from '@/server/application/procedures/get-chat-messages';

export const prerender = false;

export const GET: APIRoute = astroAdapter(getChatMessages);

export const POST: APIRoute = astroAdapter(sendChatMessage);
