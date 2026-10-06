#!/usr/bin/env node
import { run } from './run.js';

process.exit(await run(process.argv.slice(2), process.cwd()));
