import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { matchesGlob, resolve } from 'node:path';
import { promisify } from 'node:util';
import type { CheckContext } from './config.js';

type Options = { commitMsgFile?: string; range?: string };

const exec = promisify(execFile);

const git = async (cwd: string, args: string[]): Promise<string> =>
  (await exec('git', args, { cwd, maxBuffer: 64 * 1024 * 1024 })).stdout;

const SEPARATOR = '\u001e';
const SCISSORS = '# ------------------------ >8 ------------------------';

const stripComments = (message: string): string => {
  const lines = message.split(/\r?\n/);
  const cut = lines.indexOf(SCISSORS);
  return (cut === -1 ? lines : lines.slice(0, cut))
    .filter((line) => !line.startsWith('#'))
    .join('\n');
};

export const createSnapshot = async (
  projectRoot: string,
  { commitMsgFile, range }: Options = {},
) => {
  const lines = async (args: string[]): Promise<string[]> =>
    (await git(projectRoot, ['ls-files', '-z', ...args]))
      .split('\0')
      .filter(Boolean);
  const deleted = new Set(await lines(['--deleted']));
  const files = [
    ...new Set(await lines(['--cached', '--others', '--exclude-standard'])),
  ]
    .filter((file) => !deleted.has(file))
    .sort();
  const texts = new Map<string, Promise<string>>();
  const readText = (file: string): Promise<string> => {
    const cached = texts.get(file);
    if (cached) return cached;
    const text = readFile(resolve(projectRoot, file), 'utf8');
    texts.set(file, text);
    return text;
  };
  const readLog = async (
    revisions: string[],
    strict = false,
  ): Promise<string[]> =>
    (
      await git(projectRoot, ['log', ...revisions, '--format=%B%x1e']).catch(
        (error: unknown) => {
          if (strict) throw error;
          return '';
        },
      )
    )
      .split(SEPARATOR)
      .map((message) => message.replace(/^\n/, ''))
      .filter((message) => message.trim() !== '');
  const commitMessages = commitMsgFile
    ? [
        stripComments(
          await readFile(resolve(projectRoot, commitMsgFile), 'utf8'),
        ),
      ]
    : range
      ? await readLog([range], true)
      : await readLog(['-1']);

  return {
    contextFor: (
      rule: { id: string; include?: string[]; exclude?: string[] },
      report: (message: string) => void,
    ): CheckContext => ({
      files: files.filter(
        (file) =>
          (!rule.include ||
            rule.include.some((glob) => matchesGlob(file, glob))) &&
          !(rule.exclude ?? []).some((glob) => matchesGlob(file, glob)),
      ),
      readText,
      git: {
        commitMessages,
        lastCommitMessages: (count) => readLog([`-${count}`]),
      },
      report,
      meta: { ruleId: rule.id, projectRoot },
    }),
  };
};
