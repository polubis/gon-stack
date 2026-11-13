import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { McpGateway } from '../gateway';
import { handleMcpUpload } from '../http';
import { uploadAttachment } from '../../../../../../scripts/parka-upload.mjs';

const TOKEN = 'parka_mcp_abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG';
const ENV = {
  PARKA_MCP_URL: 'https://parka.test/api/mcp/',
  PARKA_MCP_TOKEN: TOKEN,
};

const setup = () => {
  const stored: { taskId: string; name: string; mime: string; size: number }[] =
    [];
  const gateway = {
    addTaskAttachment: async (
      taskId: string,
      file: { name: string; mime: string; bytes: ArrayBuffer },
    ) => {
      stored.push({
        taskId,
        name: file.name,
        mime: file.mime,
        size: file.bytes.byteLength,
      });
      return {
        id: 'a-1',
        name: file.name,
        mime: file.mime,
        size: file.bytes.byteLength,
      };
    },
    notifyChange: async () => undefined,
  } as unknown as McpGateway;
  const fetchImpl = (url: URL, init: RequestInit) =>
    handleMcpUpload(new Request(url, init), { gatewayFor: () => gateway });
  return { stored, fetchImpl };
};

const fileOf = async (name: string, bytes: number) => {
  const path = join(await mkdtemp(join(tmpdir(), 'upload-')), name);
  await writeFile(path, new Uint8Array(bytes));
  return path;
};

describe('parka-upload script', () => {
  it('delivers a binary video to the task through the raw endpoint', async () => {
    const { stored, fetchImpl } = setup();
    const file = await fileOf('demo.mp4', 3 * 1024 * 1024);

    const attachment = await uploadAttachment({
      taskId: 't-1',
      file,
      env: ENV,
      fetchImpl,
    });

    expect(attachment).toMatchObject({ name: 'demo.mp4', mime: 'video/mp4' });
    expect(stored).toEqual([
      {
        taskId: 't-1',
        name: 'demo.mp4',
        mime: 'video/mp4',
        size: 3 * 1024 * 1024,
      },
    ]);
  });

  it('asks the owner for env instead of reading MCP config when token is missing', async () => {
    const { fetchImpl } = setup();
    const file = await fileOf('shot.png', 10);

    await expect(
      uploadAttachment({ taskId: 't-1', file, env: {}, fetchImpl }),
    ).rejects.toThrow(/PARKA_MCP_TOKEN.*environment/);
  });

  it('refuses a file type the server does not accept', async () => {
    const { fetchImpl } = setup();
    const file = await fileOf('a.zip', 10);

    await expect(
      uploadAttachment({ taskId: 't-1', file, env: ENV, fetchImpl }),
    ).rejects.toThrow(/Unsupported/);
  });

  it('never leaks the token in a failure message', async () => {
    const file = await fileOf('shot.png', 10);
    const fetchImpl = async () =>
      new Response('{"error":"nope"}', { status: 401 });

    const failure = await uploadAttachment({
      taskId: 't-1',
      file,
      env: ENV,
      fetchImpl,
    }).catch((e: Error) => e.message);

    expect(failure).toContain('401');
    expect(failure).not.toContain(TOKEN);
  });
});
