// Imports the package sources by relative path on purpose: `pnpm reset` is the
// fix for a broken checkout, so it must run without install or build output.
import { config } from '../packages/ecosystem-resources/src/config.ts';
import { allPorts, ports } from '../packages/ecosystem-resources/src/ports.ts';

export default config({
  clean: {
    paths: [
      '.evidences',
      '.playwright-mcp',
      '{apps,packages}/*/test-results',
      '{apps,packages}/*/playwright-report',
      '{apps,packages}/*/blob-report',
    ],
    // factory agent uses this lock as its "task in progress" guard.
    keep: ['.evidences/factory.lock'],
  },
  databases: [
    {
      app: 'parka',
      dir: 'apps/parka',
      ports: ports['supabase-parka'],
      dev: ports.dev.parka,
      e2e: ports.e2e.parka,
      authPaths: ['/api/auth/callback/', '/api/auth/confirm/'],
      env: {
        file: 'apps/parka/.env.example',
        apiUrlKey: 'PUBLIC_PARKA_SUPABASE_URL',
      },
    },
    {
      app: 'talent-orbit',
      dir: 'apps/talent-orbit',
      ports: ports['supabase-talent-orbit'],
      dev: ports.dev['talent-orbit'],
      e2e: ports.e2e['talent-orbit'],
      authPaths: ['/api/auth/callback/'],
      env: {
        file: 'apps/talent-orbit/.env.example',
        apiUrlKey: 'PUBLIC_SUPABASE_URL',
        callbackKey: 'AUTH_CALLBACK_URL',
      },
    },
    {
      app: 'romantic-app',
      dir: 'apps/romantic-app',
      ports: ports['supabase-romantic-app'],
      dev: ports.dev['romantic-app'],
      e2e: ports.e2e['romantic-app'],
      authPaths: ['/api/auth/callback/'],
      env: {
        file: 'apps/romantic-app/.env.example',
        apiUrlKey: 'PUBLIC_SUPABASE_URL',
        callbackKey: 'AUTH_CALLBACK_URL',
      },
    },
  ],
  ports: allPorts(),
});
