/**
 * Sample course for the knowledge module: Supabase in 10 lessons of 5-6 short
 * reels. Plain data, no logic; `create-knowledge-demo` stores it for the user.
 * Markdown uses real, current Supabase behaviour (hosted + local CLI).
 */

export type DemoLesson = {
  title: string;
  description: string;
  tags: string[];
  reels: string[];
};

export const DEMO_CATEGORY = { name: 'Bazy danych', color: '#10b981' };

export const DEMO_CATALOG = {
  name: 'Nauka Supabase',
  description: 'Ten lessons from first project to production.',
};

export const DEMO_TAGS = [
  'supabase',
  'postgres',
  'auth',
  'security',
  'storage',
  'realtime',
  'edge',
  'sdk',
  'cli',
  'testing',
];

export const DEMO_LESSONS: DemoLesson[] = [
  {
    title: '1. Projects and the dashboard',
    description: 'What a Supabase project is and where to click first.',
    tags: ['supabase'],
    reels: [
      `# What is Supabase

**Supabase** is an open-source backend built around **Postgres**.

Each project gives you:

- a Postgres database
- Auth, Storage and Realtime
- Edge Functions
- an auto-generated REST API`,
      `# Create a project

In the dashboard choose **New project** and set:

- **name** and **organization**
- **region** (pick one near your users)
- a strong **database password**

Save the password: you need it for direct connections.`,
      `# Table Editor and SQL Editor

- **Table Editor**: spreadsheet-like view to create tables and edit rows.
- **SQL Editor**: run any SQL and save snippets.

Everything the UI does is plain Postgres underneath.`,
      `# API keys

Each project has two kinds of keys:

- **anon / publishable**: safe in the browser, power depends on **RLS**
- **service_role / secret**: bypasses RLS, **server only**

\`\`\`txt
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<publishable key>
\`\`\`

Never ship the service key to a client.`,
      `# Auto-generated API

Every table in the exposed schema (\`public\`) becomes a REST endpoint through **PostgREST**:

\`\`\`txt
GET /rest/v1/todos?select=id,title&done=eq.false
\`\`\`

Access is decided by Postgres roles and **Row Level Security**.`,
      `# Free plan basics

- Free projects **pause after a week of inactivity**
- Paid plans add backups and bigger compute
- Check **Reports** and **Logs** to see usage

Treat the dashboard as a window onto your database, not the source of truth for schema: use migrations.`,
    ],
  },
  {
    title: '2. Postgres tables and SQL',
    description: 'Tables, types, keys and queries you use every day.',
    tags: ['supabase', 'postgres'],
    reels: [
      `# Create a table

\`\`\`sql
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
\`\`\`

Prefer \`timestamptz\` and \`uuid\` keys.`,
      `# Data types worth knowing

- \`text\` (no need for varchar limits)
- \`integer\`, \`bigint\`, \`numeric\` for money
- \`boolean\`
- \`timestamptz\`, \`date\`
- \`jsonb\` for flexible documents
- \`uuid\``,
      `# Constraints keep data honest

- **primary key**, **unique**
- **not null**, **default**
- **check**: \`check (char_length(title) between 1 and 120)\`
- **foreign key**: \`references ... on delete cascade\`

Let the database refuse bad data, not only your app.`,
      `# Querying

\`\`\`sql
select id, title
from public.todos
where done = false
order by created_at desc
limit 20;
\`\`\`

Insert, update and delete follow standard SQL. Add \`returning *\` to get the changed rows back.`,
      `# Joins and relations

\`\`\`sql
select t.title, p.name as project
from public.todos t
join public.projects p on p.id = t.project_id;
\`\`\`

The REST API can embed related rows too: \`select=title,projects(name)\`.`,
      `# Indexes

Add an index for columns you filter or join on:

\`\`\`sql
create index todos_user_idx on public.todos (user_id, created_at desc);
\`\`\`

Use **EXPLAIN ANALYZE** to see whether a query uses it. Primary keys and unique constraints already create one.`,
    ],
  },
  {
    title: '3. Authentication',
    description: 'Sign-up, sessions and how auth ties to your tables.',
    tags: ['supabase', 'auth', 'security'],
    reels: [
      `# Supabase Auth

Auth is built in and stores users in the \`auth.users\` table.

Supported methods include:

- email + password
- magic link and one-time codes
- OAuth providers (Google, GitHub...)
- phone (SMS)`,
      `# Sign up and sign in

\`\`\`ts
await supabase.auth.signUp({ email, password });
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
\`\`\`

With **email confirmation** on, a new user must click the link before signing in.`,
      `# JWT and sessions

A signed-in user gets a **JWT access token** (short-lived) and a **refresh token**.

The client refreshes the session automatically. Postgres sees the token claims, so \`auth.uid()\` returns the current user id inside policies.`,
      `# Link your own tables to users

Reference \`auth.users\` and keep the app profile in \`public\`:

\`\`\`sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text
);
\`\`\`

Do not add columns to \`auth.users\` itself.`,
      `# On the server

- Verify users with \`supabase.auth.getUser()\`, which asks the Auth server
- Do **not** trust \`getSession()\` alone on the server: it reads the cookie without verifying
- Configure **redirect URLs** in the dashboard for OAuth and email links`,
    ],
  },
  {
    title: '4. Row Level Security',
    description: 'Policies decide who sees and changes each row.',
    tags: ['supabase', 'postgres', 'security'],
    reels: [
      `# Why RLS

The browser talks to your database through the API, so **the database must enforce access**.

**Row Level Security (RLS)** filters rows per request by the current role and user.

Without a policy an RLS-enabled table returns **no rows**.`,
      `# Enable it

\`\`\`sql
alter table public.todos enable row level security;
\`\`\`

Tables created in the dashboard Table Editor have RLS on by default; tables created with SQL do not. **Always enable it on exposed tables.**`,
      `# Owner-only policy

\`\`\`sql
create policy todos_owner on public.todos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
\`\`\`

- **using**: which existing rows are visible
- **with check**: which new/changed rows are allowed`,
      `# Wrap auth.uid() in a select

Write \`(select auth.uid())\` instead of \`auth.uid()\`.

Postgres then evaluates it **once per query** instead of once per row, which is much faster on big tables.

Also index the column used in the policy (\`user_id\`).`,
      `# Policies per command

You can split rules by operation:

- \`for select\`
- \`for insert\` (only **with check**)
- \`for update\`
- \`for delete\` (only **using**)

Policies of the same kind are combined with **OR**.`,
      `# service_role bypasses RLS

The service key skips every policy. Use it only in trusted server code and always filter by user yourself.

Test policies as a real user: in the SQL Editor switch role or use pgTAP tests (lesson 10).`,
    ],
  },
  {
    title: '5. Storage',
    description: 'Buckets, access rules and signed links for files.',
    tags: ['supabase', 'storage', 'security'],
    reels: [
      `# Buckets

**Storage** keeps files in **buckets**.

- **public** bucket: anyone with the URL can read
- **private** bucket: access needs a policy or a signed URL

Buckets can limit **file size** and **allowed MIME types**.`,
      `# Upload and download

\`\`\`ts
await supabase.storage
  .from('avatars')
  .upload(\`\${userId}/me.png\`, file, { contentType: 'image/png' });

const { data } = await supabase.storage
  .from('avatars')
  .download(\`\${userId}/me.png\`);
\`\`\``,
      `# Policies on storage.objects

Files are rows in \`storage.objects\`, so access is plain RLS:

\`\`\`sql
create policy "own folder read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
\`\`\`

A **folder per user** is the classic layout.`,
      `# Signed URLs

For private files create a short-lived link:

\`\`\`ts
const { data } = await supabase.storage
  .from('docs')
  .createSignedUrl(path, 60);
\`\`\`

The link works for 60 seconds without any login.`,
      `# Clean up files

Deleting a database row does **not** delete its file.

Remove it yourself:

\`\`\`ts
await supabase.storage.from('docs').remove([path]);
\`\`\`

Never delete from \`storage.objects\` with SQL: the stored file would stay behind.`,
    ],
  },
  {
    title: '6. Realtime',
    description: 'Live changes, broadcast and presence.',
    tags: ['supabase', 'realtime'],
    reels: [
      `# Three realtime features

- **Postgres Changes**: stream inserts, updates and deletes
- **Broadcast**: low-latency messages between clients
- **Presence**: who is online and shared state`,
      `# Enable a table

Add the table to the publication:

\`\`\`sql
alter publication supabase_realtime add table public.todos;
\`\`\`

Or use **Database -> Replication** in the dashboard.`,
      `# Listen to changes

\`\`\`ts
const channel = supabase
  .channel('todos')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => console.log(payload),
  )
  .subscribe();
\`\`\``,
      `# RLS applies

Postgres Changes respect **RLS**: a client only receives rows it is allowed to select.

For \`delete\` events the row is gone, so the payload carries only the primary key unless the table has \`replica identity full\`.`,
      `# Broadcast and presence

\`\`\`ts
const room = supabase.channel('room-1');
room.on('broadcast', { event: 'cursor' }, ({ payload }) => move(payload));
room.subscribe();
room.send({ type: 'broadcast', event: 'cursor', payload: { x, y } });
\`\`\`

Clean up with \`supabase.removeChannel(channel)\` when the view closes.`,
    ],
  },
  {
    title: '7. Edge Functions',
    description: 'Server-side TypeScript running close to users.',
    tags: ['supabase', 'edge'],
    reels: [
      `# What are Edge Functions

Small **Deno** (TypeScript) functions that run on the edge.

Use them for:

- webhooks (Stripe, GitHub)
- calling third-party APIs with secret keys
- work that must not run in the browser`,
      `# A first function

\`\`\`bash
supabase functions new hello
\`\`\`

\`\`\`ts
Deno.serve(async (req) => {
  const { name } = await req.json();
  return Response.json({ message: \`Hello \${name}\` });
});
\`\`\``,
      `# Run and deploy

\`\`\`bash
supabase functions serve
supabase functions deploy hello
\`\`\`

Call it from the client:

\`\`\`ts
await supabase.functions.invoke('hello', { body: { name: 'Ada' } });
\`\`\``,
      `# Secrets

\`\`\`bash
supabase secrets set STRIPE_KEY=sk_live_...
\`\`\`

Read with \`Deno.env.get('STRIPE_KEY')\`. Secrets stay on the server; \`SUPABASE_URL\` and keys are already provided inside functions.`,
      `# Auth in functions

By default a function requires a valid **JWT** in the \`Authorization\` header.

Create a client with the caller's token to keep **RLS** in effect:

\`\`\`ts
const supabase = createClient(url, anonKey, {
  global: { headers: { Authorization: req.headers.get('Authorization')! } },
});
\`\`\``,
    ],
  },
  {
    title: '8. The JavaScript client',
    description: 'supabase-js: queries, filters and typed results.',
    tags: ['supabase', 'sdk'],
    reels: [
      `# Install and create a client

\`\`\`bash
npm i @supabase/supabase-js
\`\`\`

\`\`\`ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(url, anonKey);
\`\`\``,
      `# Select with filters

\`\`\`ts
const { data, error } = await supabase
  .from('todos')
  .select('id, title')
  .eq('done', false)
  .order('created_at', { ascending: false })
  .limit(20);
\`\`\`

Filters: \`eq\`, \`neq\`, \`gt\`, \`in\`, \`ilike\`, \`is\`.`,
      `# Always check the error

Every call returns \`{ data, error }\` and does **not throw**.

\`\`\`ts
const { data, error } = await supabase.from('todos').select();
if (error) throw error;
\`\`\`

Handle \`error\` before touching \`data\`.`,
      `# Insert, update, delete

\`\`\`ts
await supabase.from('todos').insert({ title: 'Learn RLS' });
await supabase.from('todos').update({ done: true }).eq('id', id);
await supabase.from('todos').delete().eq('id', id);
\`\`\`

An update or delete **without a filter** is refused by default; keep a filter on every write.`,
      `# Related rows in one call

\`\`\`ts
const { data } = await supabase
  .from('projects')
  .select('name, todos(id, title)');
\`\`\`

Foreign keys define what can be embedded, one request instead of many.`,
      `# Generated types

\`\`\`bash
supabase gen types typescript --local > db-schema.ts
\`\`\`

\`\`\`ts
const supabase = createClient<Database>(url, anonKey);
\`\`\`

Queries are now type-checked against your real schema.`,
    ],
  },
  {
    title: '9. Migrations and local development',
    description: 'The CLI, local stack and versioned schema.',
    tags: ['supabase', 'cli', 'postgres'],
    reels: [
      `# Why migrations

A **migration** is a SQL file that changes the schema step by step.

- reviewed in git like code
- same schema on every machine and environment
- no manual clicking in production`,
      `# Local stack

Needs **Docker**.

\`\`\`bash
supabase init
supabase start
\`\`\`

You get Postgres, Auth, Storage and Studio on your machine, plus a local email inbox for sign-up mails.`,
      `# Create and apply

\`\`\`bash
supabase migration new add_todos
# edit supabase/migrations/<timestamp>_add_todos.sql
supabase db reset
\`\`\`

\`db reset\` rebuilds the local database from all migrations (and \`seed.sql\`).`,
      `# Diff changes made in Studio

\`\`\`bash
supabase db diff -f my_change
\`\`\`

Generates a migration from the difference between your local database and the migration files.`,
      `# Link and push

\`\`\`bash
supabase login
supabase link --project-ref <ref>
supabase db push
\`\`\`

\`db push\` applies pending migrations to the remote project. **Never edit a migration that is already applied**: add a new one.`,
    ],
  },
  {
    title: '10. Testing and production tips',
    description: 'pgTAP tests, backups and a go-live checklist.',
    tags: ['supabase', 'testing', 'security', 'postgres'],
    reels: [
      `# Test the database

**pgTAP** is a Postgres test framework. Tests live in \`supabase/tests/database\`:

\`\`\`bash
supabase test db
\`\`\`

Test constraints, defaults and, most of all, **RLS policies**.`,
      `# A pgTAP test

\`\`\`sql
begin;
select plan(1);

select throws_ok(
  $$insert into public.todos (user_id, title) values (gen_random_uuid(), '')$$,
  '23503', null, 'unknown owner is refused');

select * from finish();
rollback;
\`\`\`

The transaction is rolled back, so tests leave no data.`,
      `# Test RLS as a user

Switch to the API role and fake the JWT claims:

\`\`\`sql
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"<user uuid>","role":"authenticated"}', true);
\`\`\`

Then assert that user B sees **zero** rows of user A.`,
      `# Go-live checklist

- RLS **enabled** on every exposed table
- service key only on the server
- custom **SMTP** for auth emails
- redirect URLs and site URL set
- indexes for policy and filter columns
- migrations applied through the CLI`,
      `# Backups and limits

- Paid plans have **daily backups**, **PITR** is an add-on
- Use the **connection pooler** (Supavisor) for serverless apps
- Set **rate limits** for auth and watch the **Advisors** (security and performance) in the dashboard`,
      `# Keep learning

- Docs: supabase.com/docs
- Run the **Security Advisor** after every schema change
- Practice: rebuild one feature with tables, RLS, a storage bucket and a test

Finish the course by marking the reels done.`,
    ],
  },
];
