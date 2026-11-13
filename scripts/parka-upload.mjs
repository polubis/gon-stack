// Upload one file to a Parka task through the raw endpoint (no base64, no MCP call).
// Usage: node scripts/parka-upload.mjs <taskId> <file>
// Reads PARKA_MCP_URL (MCP url or origin) and PARKA_MCP_TOKEN from the environment only.
// The token is never read from MCP config files and never printed.
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.log': 'text/plain',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.ogv': 'video/ogg',
};

export const uploadAttachment = async ({
  taskId,
  file,
  env = process.env,
  fetchImpl = fetch,
}) => {
  const url = env.PARKA_MCP_URL?.trim();
  const token = env.PARKA_MCP_TOKEN?.trim();
  if (!url || !token)
    throw new Error(
      'PARKA_MCP_URL and PARKA_MCP_TOKEN must be set in the environment. Do not read them from MCP config: report BLOCKED and ask the owner to export them.',
    );
  if (!taskId || !file) throw new Error('Usage: parka-upload <taskId> <file>');
  const mime = MIME[extname(file).toLowerCase()];
  if (!mime) throw new Error(`Unsupported file type "${extname(file)}"`);

  const endpoint = new URL('/api/mcp/attachments/', new URL(url).origin);
  endpoint.searchParams.set('taskId', taskId);
  endpoint.searchParams.set('name', basename(file));

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': mime },
    body: await readFile(file),
  });
  const text = await response.text();
  if (!response.ok)
    throw new Error(`Upload failed (${response.status}): ${text}`);
  return JSON.parse(text);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [taskId, file] = process.argv.slice(2);
  uploadAttachment({ taskId, file })
    .then((attachment) => console.log(JSON.stringify(attachment)))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
