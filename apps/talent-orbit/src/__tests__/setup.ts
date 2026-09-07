import '@testing-library/jest-dom';

vi.stubEnv('PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'dasdsa-dadasd-231edd');

afterAll(() => {
  vi.unstubAllEnvs();
});
