import { Main } from '@/modules/event-discovery/presentation/main';
import type { User } from '@supabase/supabase-js';

type ModuleProps = {
  user: User | null;
};

export const Module = ({ user }: ModuleProps) => {
  return <Main user={user} />;
};
