type MessageDto = {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
};

export const conversations = new Map<string, MessageDto[]>();
