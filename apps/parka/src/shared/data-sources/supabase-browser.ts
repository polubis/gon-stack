import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/shared/data-sources/db-schema';

export const supabaseBrowser = createBrowserClient<Database>(
  import.meta.env.PUBLIC_PARKA_SUPABASE_URL,
  import.meta.env.PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY,
);
