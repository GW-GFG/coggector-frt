type WebSocketServerEvent = {
  type: string;
  serverMsgId?: string;
  fromUserId?: string;
  toUserId?: string;
  content?: string;
};