#!/usr/bin/env node
import { run } from './run.ts';

process.exit(await run(process.argv.slice(2), { root: process.cwd() }));
