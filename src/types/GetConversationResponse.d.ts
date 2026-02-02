type GetConversationResponse = {
  conversationId: string;
  participants: [string, string];
  messages: ChatMessage[];
};