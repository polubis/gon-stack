import type { HashConfig } from './hash.js';
import type { AuditConfig } from './audit.js';
import type { LogConfig } from './log.js';
import type { ManifestsConfig } from './manifests.js';
import type { OutdatedConfig } from './outdated.js';

export type { HashConfig, HashTarget } from './hash.js';
export type { AuditConfig, AuditLevel, AuditRule } from './audit.js';
export type { LogConfig, LogOptions } from './log.js';
export type { ManifestsConfig } from './manifests.js';
export type { OutdatedConfig } from './outdated.js';
export type { CheckResult } from './types.js';

export type Config = {
  hash?: HashConfig;
  manifests?: ManifestsConfig;
  log?: LogConfig;
  audit?: AuditConfig;
  outdated?: OutdatedConfig;
};

/** Identity helper giving `nitpick.config.mts` type-checking + autocomplete. */
export const defineConfig = (config: Config): Config => config;
