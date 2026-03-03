/** Thread state for list item display */
export type ThreadState = 'active' | 'idle' | 'loading' | 'error';

/** Thread list item for sidebar */
export interface Thread {
  id: string;
  title: string;
  preview: string;
  time: string;
  unread: number;
  active: boolean;
  state: ThreadState;
}

/** Message role for chat bubbles */
export type MessageRole = 'model' | 'user' | 'system';

/** Single message in the conversation */
export interface Message {
  id: string;
  role: MessageRole;
  body: string;
}

/** Summary for the threads sidebar header (e.g. "12 total") */
export interface ThreadsSummary {
  total: number;
}

/** Active thread header (title + model info) */
export interface ActiveThreadHeader {
  title: string;
  modelLabel: string;
  contextStatus: string;
}

/** Connection status for footer */
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

/** Aggregate view model for the chat UI (threads list, messages, header, footer) */
export interface ChatViewModel {
  threads: Thread[];
  messages: Message[];
  threadsSummary: ThreadsSummary;
  activeThreadHeader: ActiveThreadHeader;
  connectionStatus: ConnectionStatus;
}
