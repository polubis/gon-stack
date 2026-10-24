import type { APIRoute } from 'astro';
import { astroAdapter } from '@/server/application/adapter/astro';
import { sendTimeTaskToBacklog } from '@/server/application/procedures/send-time-task-to-backlog';
import { updateTimeBacklogTask } from '@/server/application/procedures/update-time-backlog-task';

export const prerender = false;

export const PUT: APIRoute = astroAdapter(updateTimeBacklogTask);

export const POST: APIRoute = astroAdapter(sendTimeTaskToBacklog);
