import '@testing-library/jest-dom';

vi.stubEnv('PUBLIC_PARKA_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('PUBLIC_PARKA_SUPABASE_PUBLISHABLE_KEY', 'dasdsa-dadasd-231edd');

afterAll(() => {
  vi.unstubAllEnvs();
});
