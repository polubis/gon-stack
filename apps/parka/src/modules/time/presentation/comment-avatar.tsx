import type { ComponentProps } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { CommentOwner, TaskComment } from '../domain/models';

const Face = ({ owner, half }: { owner: CommentOwner; half?: boolean }) =>
  owner.avatarUrl ? (
    <img
      src={owner.avatarUrl}
      alt=""
      decoding="async"
      className={cn(
        'h-full object-cover',
        half ? 'w-[200%] max-w-none object-left' : 'w-full',
      )}
    />
  ) : (
    <span className="grid h-full w-full place-items-center bg-brand-soft text-brand-dark">
      <User className={half ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
    </span>
  );

const BotFace = ({ half }: { half?: boolean }) => (
  <span className="grid h-full w-full place-items-center bg-track text-ink">
    <Bot className={half ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
  </span>
);

/**
 * Who wrote it: the owner's picture, the bot icon, or both halves of a circle
 * when the owner edited what a bot wrote (owner left, bot right).
 */
export const CommentAvatar = ({
  comment,
  owner,
  className,
  ...rest
}: ComponentProps<'span'> & {
  comment: TaskComment;
  owner: CommentOwner;
}) => {
  const kind = !comment.bot ? 'owner' : comment.editedAt ? 'split' : 'bot';
  return (
    <span
      role="img"
      aria-label={
        kind === 'owner'
          ? `Autor: ${owner.name}`
          : kind === 'bot'
            ? `Autor: bot ${comment.bot!.name}`
            : `Autorzy: ${owner.name} i bot ${comment.bot!.name}`
      }
      data-kind={kind}
      className={cn(
        'flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-line-strong bg-card',
        className,
      )}
      {...rest}
    >
      {kind === 'owner' ? <Face owner={owner} /> : null}
      {kind === 'bot' ? <BotFace /> : null}
      {kind === 'split' ? (
        <>
          <span className="h-full w-1/2 overflow-hidden">
            <Face owner={owner} half />
          </span>
          <span className="h-full w-1/2 overflow-hidden">
            <BotFace half />
          </span>
        </>
      ) : null}
    </span>
  );
};
