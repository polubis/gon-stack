import { definePorts } from './define-ports.ts';

/**
 * Single source of truth for every local port in the monorepo.
 * Each group owns a dedicated range; ports are unique across all groups.
 * Edit here, then run `pnpm ecosystem:sync` for generated files (supabase
 * config.toml, .env.example). `pnpm ecosystem:check` fails on drift.
 */
export const registry = definePorts({
  ranges: {
    dev: [4300, 4399],
    e2e: [4400, 4499],
    'supabase-parka': [54100, 54199],
    'supabase-talent-orbit': [54200, 54299],
    'supabase-romantic-app': [54300, 54399],
  },
  ports: {
    dev: {
      'polubinski-dev': 4301,
      kdebek: 4302,
      parka: 4303,
      'talent-orbit': 4304,
      'romantic-app': 4305,
      'content-maker': 4306,
      'uih-docs': 4307,
    },
    e2e: {
      'polubinski-dev': 4401,
      kdebek: 4402,
      parka: 4403,
      'talent-orbit': 4404,
      'romantic-app': 4405,
      'content-maker': 4406,
      uih: 4407,
    },
    'supabase-parka': {
      api: 54101,
      db: 54102,
      shadow: 54103,
      pooler: 54104,
      studio: 54105,
      mail: 54106,
      analytics: 54107,
      inspector: 54108,
    },
    'supabase-talent-orbit': {
      api: 54201,
      db: 54202,
      shadow: 54203,
      pooler: 54204,
      studio: 54205,
      mail: 54206,
      analytics: 54207,
      inspector: 54208,
    },
    'supabase-romantic-app': {
      api: 54301,
      db: 54302,
      shadow: 54303,
      pooler: 54304,
      studio: 54305,
      mail: 54306,
      analytics: 54307,
      inspector: 54308,
    },
  },
});

export const ports = registry.ports;

export const allPorts = (): number[] =>
  Object.values(ports).flatMap((group) => Object.values(group));
