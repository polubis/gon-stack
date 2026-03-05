export type ThreadId = string;
export type MessageId = string;

export type Thread = {
  id: ThreadId;
  title: string;
  preview: string;
  time: string;
  unread: number;
  active: boolean;
  state: 'idle' | 'busy' | 'error' | 'finished';
};

export type Message = {
  id: MessageId;
  role: 'model' | 'user' | 'system';
  body: string;
};
