import { supabaseBrowser } from '@/shared/data-sources/supabase-browser';
import type { Auth } from '../domain/models';
import { toAuth } from './mappers';

/**
 * Nothing else in this module talks to Supabase. Any failure to verify the
 * session (missing session, network, server) resolves as signed out.
 */
export const fetchAuth = async (): Promise<Auth> => {
  try {
    const { data, error } = await supabaseBrowser.auth.getUser();
    return toAuth(error ? null : data.user);
  } catch {
    return toAuth(null);
  }
};

/** Returns an unsubscribe function. */
export const subscribeAuth = (onChange: (auth: Auth) => void) => {
  const { data } = supabaseBrowser.auth.onAuthStateChange((_, session) =>
    onChange(toAuth(session?.user)),
  );
  return () => data.subscription.unsubscribe();
};
