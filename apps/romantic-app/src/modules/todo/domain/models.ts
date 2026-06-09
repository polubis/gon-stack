import type { Brand } from '@repo/type-beast/brand';

export type ThreadId = Brand<string, 'ThreadId'>;
export type MessageId = Brand<string, 'MessageId'>;

export type ThreadState = 'idle' | 'active' | 'loading' | 'error';
export type MessageRole = 'model' | 'user' | 'system';
export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export type Thread = {
  id: ThreadId;
  title: string;
  preview: string;
  time: string;
  unread: number;
  active: boolean;
  state: ThreadState;
};

export type Message = {
  id: MessageId;
  role: MessageRole;
  body: string;
};
