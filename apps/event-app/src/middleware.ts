import { defineMiddleware } from 'astro:middleware';
import { supabaseServer } from '@/shared/data-sources/supabase-server';

const PROTECTED_ROUTES = ['/event/create'];

export const onRequest = defineMiddleware(
  async ({ request, cookies, redirect, url }, next) => {
    if (!PROTECTED_ROUTES.some((route) => url.pathname.startsWith(route))) {
      return next();
    }

    const supabase = supabaseServer({ request, cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect('/login');
    }

    return next();
  },
);
