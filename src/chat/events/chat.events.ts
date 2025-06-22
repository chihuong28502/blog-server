export enum ChatEventType {
  MESSAGE_SENT = 'message_sent',
  MESSAGE_READ = 'message_read',
  USER_TYPING = 'user_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
}

export interface ChatEvent {
  type: ChatEventType;
  payload: any;
  timestamp: Date;
}

export interface MessageSentEvent extends ChatEvent {
  type: ChatEventType.MESSAGE_SENT;
  payload: {
    messageId: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
  };
}

export interface MessageReadEvent extends ChatEvent {
  type: ChatEventType.MESSAGE_READ;
  payload: {
    messageId: string;
    readerId: string;
  };
}

export interface UserTypingEvent extends ChatEvent {
  type: ChatEventType.USER_TYPING;
  payload: {
    userId: string;
    conversationId: string;
    isTyping: boolean;
  };
}

export interface UserStatusEvent extends ChatEvent {
  type: ChatEventType.USER_ONLINE | ChatEventType.USER_OFFLINE;
  payload: {
    userId: string;
    lastSeen?: Date;
  };
}