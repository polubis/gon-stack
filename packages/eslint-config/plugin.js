/**
 * Repo-specific ESLint rules (`repo/*`). No dependencies, plain AST.
 * Each rule mirrors one line of `.claude/rules/*.md`.
 */

const TEST_FNS = new Set(['it', 'test', 'describe']);
const TEST_MODIFIERS = new Set([
  'only',
  'skip',
  'concurrent',
  'fails',
  'todo',
  'sequential',
]);

const isNode = (value) => value && typeof value.type === 'string';

/** `it`, `it.only`, `test.skip` ... -> base name, otherwise `null`. */
const testCallName = (callee) => {
  if (callee.type === 'Identifier')
    return TEST_FNS.has(callee.name) ? callee.name : null;
  if (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    TEST_FNS.has(callee.object.name) &&
    callee.property.type === 'Identifier' &&
    TEST_MODIFIERS.has(callee.property.name)
  )
    return callee.object.name;
  return null;
};

const staticTitle = (node) => {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string')
    return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked;
  return null;
};

const isFunction = (node) =>
  node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression';

const calleeName = (node) => {
  const { callee } = node;
  if (callee.type === 'Identifier') return callee.name;
  if (
    callee.type === 'MemberExpression' &&
    callee.property.type === 'Identifier'
  )
    return callee.property.name;
  return null;
};

const hasAncestorCall = (sourceCode, node, names) =>
  sourceCode
    .getAncestors(node)
    .some(
      (ancestor) =>
        ancestor.type === 'CallExpression' &&
        ancestor.callee.type === 'Identifier' &&
        names.includes(ancestor.callee.name),
    );

const GHERKIN = /^\s*(given|when|then|and|but)\b/i;

const testTitle = {
  meta: {
    type: 'suggestion',
    schema: [
      {
        type: 'object',
        properties: { maxLength: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      gherkin:
        'Test title "{{title}}" is Gherkin (Given/When/Then). Write a short user-story name, e.g. "shows an error for an empty name".',
      tooLong:
        'Test title is {{length}} chars, max {{max}}. Keep it short, like a user story.',
      duplicate:
        'Duplicate {{kind}} title "{{title}}" in the same block. Titles must be unique.',
    },
  },
  create(context) {
    const max = context.options[0]?.maxLength ?? 100;
    const sourceCode = context.sourceCode;
    const seen = new Map();
    return {
      CallExpression(node) {
        const kind = testCallName(node.callee);
        if (!kind) return;
        const title = staticTitle(node.arguments[0]);
        if (title === null) return;
        const target = node.arguments[0];
        if (GHERKIN.test(title))
          context.report({
            node: target,
            messageId: 'gherkin',
            data: { title },
          });
        if (title.length > max)
          context.report({
            node: target,
            messageId: 'tooLong',
            data: { length: title.length, max },
          });
        const scope =
          [...sourceCode.getAncestors(node)].reverse().find(isFunction) ??
          sourceCode.ast;
        const key = `${kind === 'describe' ? 'describe' : 'test'}\u0000${title}`;
        const titles = seen.get(scope) ?? new Set();
        seen.set(scope, titles);
        if (titles.has(key))
          context.report({
            node: target,
            messageId: 'duplicate',
            data: {
              kind: kind === 'describe' ? 'describe' : 'test',
              title,
            },
          });
        titles.add(key);
      },
    };
  },
};

// `expect(...)`/`assert...(...)`, or a Testing Library `get*`/`find*` query:
// it throws when nothing matches, so it is an implicit assertion.
const DEFAULT_ASSERTION =
  /\b(?:expect|assert)\w*\s*[.(]|\bexpectTypeOf\b|\b(?:get|find)(?:All)?By\w+\s*\(/;

const expectExpect = {
  meta: {
    type: 'problem',
    schema: [
      {
        type: 'object',
        properties: { assertionPattern: { type: 'string' } },
        additionalProperties: false,
      },
    ],
    messages: {
      missing:
        'Test "{{title}}" has no assertion. Add expect(...) so it can fail.',
    },
  },
  create(context) {
    const pattern = context.options[0]?.assertionPattern
      ? new RegExp(context.options[0].assertionPattern)
      : DEFAULT_ASSERTION;
    const sourceCode = context.sourceCode;
    return {
      CallExpression(node) {
        const kind = testCallName(node.callee);
        if (kind !== 'it' && kind !== 'test') return;
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'todo'
        )
          return;
        const callback = node.arguments.find(isFunction);
        if (!callback) return;
        if (pattern.test(sourceCode.getText(callback.body))) return;
        context.report({
          node,
          messageId: 'missing',
          data: { title: staticTitle(node.arguments[0]) ?? '(dynamic)' },
        });
      },
    };
  },
};

const mswLifecycle = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      listen:
        "msw server must start in beforeAll with server.listen({ onUnhandledRequest: 'error' }).",
      unhandled:
        "server.listen must pass onUnhandledRequest: 'error' so unmocked requests fail the test.",
      reset: 'msw server needs server.resetHandlers() in afterEach.',
      close: 'msw server needs server.close() in afterAll.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    let setup = null;
    const listens = [];
    const resets = [];
    const closes = [];
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'setupServer'
        ) {
          setup ??= node;
          return;
        }
        if (node.callee.type !== 'MemberExpression') return;
        const name = calleeName(node);
        if (name === 'listen') listens.push(node);
        if (name === 'resetHandlers') resets.push(node);
        if (name === 'close') closes.push(node);
      },
      'Program:exit'() {
        if (!setup) return;
        const inHook = (node, hook) =>
          hasAncestorCall(sourceCode, node, [hook]);
        const okListen = listens.filter((node) => inHook(node, 'beforeAll'));
        if (okListen.length === 0) {
          context.report({ node: setup, messageId: 'listen' });
        }
        for (const node of okListen) {
          const options = node.arguments[0];
          const strict =
            options?.type === 'ObjectExpression' &&
            options.properties.some(
              (property) =>
                property.type === 'Property' &&
                ((property.key.type === 'Identifier' &&
                  property.key.name === 'onUnhandledRequest') ||
                  (property.key.type === 'Literal' &&
                    property.key.value === 'onUnhandledRequest')) &&
                property.value.type === 'Literal' &&
                property.value.value === 'error',
            );
          if (!strict) context.report({ node, messageId: 'unhandled' });
        }
        if (!resets.some((node) => inHook(node, 'afterEach')))
          context.report({ node: setup, messageId: 'reset' });
        if (!closes.some((node) => inHook(node, 'afterAll')))
          context.report({ node: setup, messageId: 'close' });
      },
    };
  },
};

const noBarrel = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      barrel:
        'Barrel export. Import from the file that owns the symbol, do not re-export it.',
    },
  },
  create(context) {
    return {
      ExportAllDeclaration: (node) =>
        context.report({ node, messageId: 'barrel' }),
      ExportNamedDeclaration(node) {
        if (node.source) context.report({ node, messageId: 'barrel' });
      },
    };
  },
};

const SUPABASE_SOURCE = /(?:^|[/@])supabase/i;

/**
 * Heuristic (no types): in a file that imports Supabase, `new InternalServer(x)`
 * where x is `error`, `*Error` or `*.error` is a Supabase result going out as a
 * blind 500. A `catch (error)` value is an unknown throw, not a result, so it
 * is left alone. The mapper itself is exempted in config.
 */
const noRawInternalServer = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      raw: 'Supabase error passed to InternalServer. Use `throw fromSupabaseError(error)` so codes map to 401/409/429 and the original stays as cause.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    let importsSupabase = false;
    const suspects = [];
    const mentionsError = (node) => {
      if (!isNode(node)) return false;
      if (node.type === 'Identifier')
        return /(?:^e|[a-z]E)rror$/.test(node.name);
      if (node.type === 'ChainExpression')
        return mentionsError(node.expression);
      if (node.type === 'MemberExpression')
        return (
          (node.property.type === 'Identifier' &&
            node.property.name === 'error') ||
          mentionsError(node.object)
        );
      return false;
    };
    const isCatchParam = (node) => {
      if (node.type !== 'Identifier') return false;
      let scope = sourceCode.getScope(node);
      while (scope) {
        const variable = scope.set.get(node.name);
        if (variable)
          return variable.defs.some((def) => def.type === 'CatchClause');
        scope = scope.upper;
      }
      return false;
    };
    return {
      ImportDeclaration(node) {
        if (SUPABASE_SOURCE.test(String(node.source.value)))
          importsSupabase = true;
      },
      NewExpression(node) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'InternalServer'
        )
          return;
        const [arg] = node.arguments;
        if (arg && mentionsError(arg) && !isCatchParam(arg))
          suspects.push(node);
      },
      'Program:exit'() {
        if (!importsSupabase) return;
        for (const node of suspects) context.report({ node, messageId: 'raw' });
      },
    };
  },
};

const ARBITRARY_PX = /(?:^|[\s:!"'`])-?[a-z][\w-]*-\[[^\]\s]*\d\s*px[^\]\s]*\]/;
const RAW_Z = /(?:^|[\s:!"'`])-?z-(?:\d+|\[[^\]]*\]|auto)(?![\w-])/;
const STYLE_PX = /(?<![\w-])\d*\.?\d+px\b/;

const noRawTailwind = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      px: 'Raw px in class "{{value}}". Use a design token / rem scale, never px.',
      z: 'Raw z-index in class "{{value}}". Use a scale token, e.g. z-(--z-toast).',
      stylePx: 'Raw px in inline style. Use a design token / rem scale.',
    },
  },
  create(context) {
    const check = (node, text) => {
      if (ARBITRARY_PX.test(text))
        context.report({ node, messageId: 'px', data: { value: text.trim() } });
      if (RAW_Z.test(text))
        context.report({ node, messageId: 'z', data: { value: text.trim() } });
    };
    return {
      Literal(node) {
        if (
          typeof node.value === 'string' &&
          node.parent.type !== 'ImportDeclaration'
        )
          check(node, node.value);
      },
      TemplateElement: (node) => check(node, node.value.cooked ?? ''),
      JSXAttribute(node) {
        if (node.name.name !== 'style') return;
        if (STYLE_PX.test(context.sourceCode.getText(node.value ?? node)))
          context.report({ node, messageId: 'stylePx' });
      },
    };
  },
};

export const plugin = {
  meta: { name: 'repo' },
  rules: {
    'test-title': testTitle,
    'expect-expect': expectExpect,
    'msw-lifecycle': mswLifecycle,
    'no-barrel': noBarrel,
    'no-raw-internal-server': noRawInternalServer,
    'no-raw-tailwind': noRawTailwind,
  },
};
