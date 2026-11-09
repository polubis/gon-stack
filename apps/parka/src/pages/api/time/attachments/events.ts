import type { APIRoute } from 'astro';
import { attachmentEventSchema } from '@schemas/time';
import { supabaseServer } from '@/shared/data-sources/supabase-server';
import { toTaskAttachment } from '@/server/application/shared/task-attachment';
import type { Database } from '@/shared/data-sources/db-schema';

export const prerender = false;

type Row = Database['public']['Tables']['time_task_attachments']['Row'];

const HEARTBEAT_MS = 20_000;

/**
 * Server-sent events: every change of the signed-in user's attachment rows
 * (Supabase Realtime, filtered by owner and RLS), so uploads report back live.
 */
export const GET: APIRoute = async (context) => {
  const db = supabaseServer(context);
  const user = await db.auth.getUser();
  const session = await db.auth.getSession();
  const token = session.data.session?.access_token;
  if (user.error || !user.data.user || !token)
    return new Response(null, { status: 401 });

  await db.realtime.setAuth(token);
  const encoder = new TextEncoder();
  let stop = () => {};

  const body = new ReadableStream<Uint8Array>({
    start: (controller) => {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      const channel = db
        .channel(`attachments:${user.data.user.id}`)
        .on<Row>(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'time_task_attachments',
            filter: `user_id=eq.${user.data.user.id}`,
          },
          (change) => {
            const row = change.eventType === 'DELETE' ? null : change.new;
            const event = attachmentEventSchema.parse({
              type: change.eventType,
              taskId: row?.task_id,
              attachment: row ? toTaskAttachment(row) : undefined,
              id: change.eventType === 'DELETE' ? change.old.id : undefined,
            });
            send(`data: ${JSON.stringify(event)}\n\n`);
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') send(': ready\n\n');
        });
      const beat = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);
      stop = () => {
        clearInterval(beat);
        void db.removeChannel(channel);
      };
      context.request.signal.addEventListener('abort', () => {
        stop();
        controller.close();
      });
    },
    cancel: () => stop(),
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'private, no-store',
      Connection: 'keep-alive',
    },
  });
};
