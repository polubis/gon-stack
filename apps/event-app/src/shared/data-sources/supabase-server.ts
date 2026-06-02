import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { type Database } from './db-schema';

export const supabaseServer = ({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) => {
  const cookieHeader = request.headers.get('Cookie') || '';

  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(cookieHeader);
          return parsed.map(({ name, value }) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options),
          );
        },
      },
    },
  );
};

export type SupabaseServer = ReturnType<typeof supabaseServer>;
