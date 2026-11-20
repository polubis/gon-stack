import '@testing-library/jest-dom';
import { ports } from '@repo/ecosystem-resources/ports';

vi.stubEnv(
  'PUBLIC_SUPABASE_URL',
  `http://127.0.0.1:${ports['supabase-talent-orbit'].api}`,
);
vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'dasdsa-dadasd-231edd');

afterAll(() => {
  vi.unstubAllEnvs();
});
