type WebSocketServerEvent = {
  type: string;
  serverMsgId?: string;
  fromUserId?: string;
  fromUsername?: string;
  toUserId?: string;
  content?: string;
};