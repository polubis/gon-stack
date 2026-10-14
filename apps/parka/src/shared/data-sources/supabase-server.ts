import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from '@/shared/data-sources/db-schema';
import { STORAGE_KEY, sessionStore } from './session-store';

export const supabaseServer = ({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) => {
  const { getAll, setAll } = sessionStore({ request, cookies });

  return createServerClient<Database>(
    import.meta.env.PUBLIC_PARKA_SUPABASE_URL,
    import.meta.env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: { name: STORAGE_KEY },
      cookies: { getAll, setAll },
    },
  );
};

export type SupabaseServer = ReturnType<typeof supabaseServer>;
