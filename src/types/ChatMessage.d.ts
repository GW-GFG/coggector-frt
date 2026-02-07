type ChatMessage = {
  serverMsgId: string;
  conversationId: string;
  fromUserId: string;
  fromUsername?: string;
  toUserId: string;
  content: string;
  sentAt: string;
};