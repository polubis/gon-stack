import type { Database } from '@/shared/data-sources/db-schema';

type Row = Database['public']['Tables']['time_task_comments']['Row'];

/** What a comment row needs to be shown: never the token, only its current name. */
export const TASK_COMMENT_COLUMNS =
  'id, body, created_at, edited_at, mcp_token_id, bot_name, bot_ref';

export type TaskCommentRow = Pick<
  Row,
  | 'id'
  | 'body'
  | 'created_at'
  | 'edited_at'
  | 'mcp_token_id'
  | 'bot_name'
  | 'bot_ref'
>;

/** Current names of the tokens that wrote comments, by token id. */
export const tokenNames = (
  tokens: { id: string; name: string }[],
): Map<string, string> => new Map(tokens.map((t) => [t.id, t.name]));

/** A renamed token signs with its new name; a deleted one keeps the name it had. */
export const toTaskComment = (
  row: TaskCommentRow,
  names: Map<string, string>,
) => ({
  id: row.id,
  body: row.body,
  createdAt: row.created_at,
  editedAt: row.edited_at,
  bot:
    row.bot_ref && row.bot_name
      ? {
          name:
            (row.mcp_token_id && names.get(row.mcp_token_id)) || row.bot_name,
          ref: row.bot_ref,
        }
      : null,
});
