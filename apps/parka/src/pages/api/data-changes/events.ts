import type { APIRoute } from 'astro';
import { dataChangeSchema } from '@schemas/data-changes';
import { supabaseServer } from '@/shared/data-sources/supabase-server';

export const prerender = false;

const HEARTBEAT_MS = 20_000;

/**
 * Server-sent events: one notice per MCP write of the signed-in user (private
 * Realtime broadcast, readable by the owner only), so open tabs reload silently.
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
        .channel(`data-changes:${user.data.user.id}`, {
          config: { private: true },
        })
        .on('broadcast', { event: 'changed' }, ({ payload }) => {
          const notice = dataChangeSchema.safeParse(payload);
          if (notice.success) send(`data: ${JSON.stringify(notice.data)}\n\n`);
        })
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
