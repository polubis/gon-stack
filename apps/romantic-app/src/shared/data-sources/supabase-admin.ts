import { createClient } from '@supabase/supabase-js';
import type { Database } from './db-schema';

export const supabaseAdmin = () =>
  createClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  );
