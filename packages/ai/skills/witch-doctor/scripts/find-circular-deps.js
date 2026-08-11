#!/usr/bin/env node
// Zero-dependency circular-import finder (Tarjan SCC over a static import/require graph).
// No npm install, no package.json — plain Node built-ins only.
// Usage: node find-circular-deps.js <targetDir> [--ext .ts,.tsx,.js,.jsx]

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { dir: null, ext: ['.ts', '.tsx', '.js', '.jsx'] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ext') args.ext = argv[++i].split(',');
    else if (!args.dir) args.dir = a;
  }
  if (!args.dir) {
    console.error(
      'Usage: node find-circular-deps.js <targetDir> [--ext .ts,.tsx,.js,.jsx]',
    );
    process.exit(1);
  }
  return args;
}

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, exts, out);
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

// Matches: import ... from '...' | export ... from '...' | import('...') | require('...') | import '...'
const IMPORT_RE =
  /(?:import|export)(?:\s+type)?[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;

function extractSpecifiers(src) {
  const specs = [];
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(src))) {
    specs.push(m[1] || m[2] || m[3] || m[4]);
  }
  return specs.filter(Boolean);
}

function resolveSpecifier(fromFile, spec, exts, fileSet) {
  if (!spec.startsWith('.')) return null; // skip package/alias imports — static resolver only, no tsconfig paths
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    ...exts.map((e) => base + e),
    ...exts.map((e) => path.join(base, 'index' + e)),
  ];
  return candidates.find((c) => fileSet.has(c)) || null;
}

function buildGraph(files, exts) {
  const fileSet = new Set(files);
  const graph = new Map(files.map((f) => [f, new Set()]));
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    for (const spec of extractSpecifiers(src)) {
      const resolved = resolveSpecifier(file, spec, exts, fileSet);
      if (resolved && resolved !== file) graph.get(file).add(resolved);
    }
  }
  return graph;
}

// Tarjan's SCC algorithm — any component with >1 node (or a self-loop) is a cycle.
function findCycles(graph) {
  let index = 0;
  const indices = new Map();
  const lowlink = new Map();
  const onStack = new Map();
  const stack = [];
  const sccs = [];

  function strongconnect(v) {
    indices.set(v, index);
    lowlink.set(v, index);
    index++;
    stack.push(v);
    onStack.set(v, true);

    for (const w of graph.get(v) || []) {
      if (!indices.has(w)) {
        strongconnect(w);
        lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)));
      } else if (onStack.get(w)) {
        lowlink.set(v, Math.min(lowlink.get(v), indices.get(w)));
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const scc = [];
      let w;
      do {
        w = stack.pop();
        onStack.set(w, false);
        scc.push(w);
      } while (w !== v);
      if (scc.length > 1 || graph.get(v).has(v)) sccs.push(scc);
    }
  }

  for (const v of graph.keys()) {
    if (!indices.has(v)) strongconnect(v);
  }
  return sccs;
}

const { dir, ext } = parseArgs(process.argv);
const root = path.resolve(dir);
const files = walk(root, ext);
const graph = buildGraph(files, ext);
const cycles = findCycles(graph).map((scc) =>
  scc.map((f) => path.relative(root, f).split(path.sep).join('/')),
);

console.log(
  JSON.stringify(
    {
      root: dir,
      filesScanned: files.length,
      cyclesFound: cycles.length,
      cycles,
    },
    null,
    2,
  ),
);
