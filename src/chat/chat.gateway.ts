import { ConfigService } from '@nestjs/config';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const configService = new ConfigService(); // Tạo một instance mới của ConfigService
      const corsOrigins = configService.get<string>('CORS_ORIGIN', '').split(',');
      if (corsOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Lang'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  private userSocketMap: Map<string, Set<string>> = new Map();
  private onlineUsers: Map<string, boolean> = new Map();
  private readonly ONLINE_TIMEOUT = 15000; // 30 giây
  private userTimeouts: Map<string, NodeJS.Timeout> = new Map();
  constructor(private readonly chatService: ChatService) { }

  afterInit(server: Server) {
  }

  handleConnection(client: Socket) {
    // Thiết lập ping interval để duy trì kết nối
    client.conn.on('packet', (packet) => {
      if (packet.type === 'pong') {
        const userId = this.getUserIdFromSocket(client);
        if (userId) {
          this.updateUserOnlineStatus(userId, true);
        }
      }
    });
  }

  handleDisconnect(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      const socketSet = this.userSocketMap.get(userId);
      if (socketSet) {
        socketSet.delete(client.id);
        this.userSocketMap.set(userId, socketSet);

        // Nếu không còn socket nào cho user này, đánh dấu là offline
        if (socketSet.size === 0) {
          this.updateUserOnlineStatus(userId, false);
          this.userSocketMap.delete(userId);
        }
      }
    }
  }


  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    const existingSockets = this.userSocketMap.get(userId) || new Set();
    existingSockets.add(client.id);
    this.userSocketMap.set(userId, existingSockets);
    this.updateUserOnlineStatus(userId, true);
    this.broadcastOnlineUsers();

    return { status: 'ok' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; content: string },
  ) {
    try {
      const senderId = this.getUserIdFromSocket(client);
      if (!senderId) {
        return { status: 'error', message: 'User not authenticated' };
      }
      this.updateUserOnlineStatus(senderId, true);
      const message = await this.chatService.createMessage(senderId, payload.receiverId, payload.content);
      const senderSocketSet: any = this.userSocketMap.get(senderId) || new Set();
      const receiverSockets: any = this.userSocketMap.get(payload.receiverId) || new Set();
      const allSockets = new Set([...senderSocketSet, ...receiverSockets]);
      if (allSockets) {
        for (const socketId of allSockets) {
          this.server.to(socketId).emit('newMessage', { message: message.message, conversationId: message.conversationId });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageId: string,
  ) {
    try {
      const userId = this.getUserIdFromSocket(client);
      if (!userId) {
        return { status: 'error', message: 'User not authenticated' };
      }
      this.updateUserOnlineStatus(userId, true);
      const updatedMessage = await this.chatService.markMessageAsRead(messageId, userId);
      return { status: 'success', message: updatedMessage };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { status: 'error', message: error.message };
    }
  }


  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      this.updateUserOnlineStatus(userId, true);
    }
    return { status: 'pong', timestamp: Date.now() };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() receiverId: string,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    if (!senderId) return;

    // Lấy danh sách socket của người nhận
    const receiverSockets = this.userSocketMap.get(receiverId) || new Set();

    // Gửi thông báo "đang nhập" đến người nhận
    for (const socketId of receiverSockets) {
      this.server.to(socketId).emit('userTyping', {
        userId: senderId,
        isTyping: true
      });
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() receiverId: string,
  ) {
    const senderId = this.getUserIdFromSocket(client);
    if (!senderId) return;

    // Lấy danh sách socket của người nhận
    const receiverSockets = this.userSocketMap.get(receiverId) || new Set();

    // Gửi thông báo "dừng nhập" đến người nhận
    for (const socketId of receiverSockets) {
      this.server.to(socketId).emit('userTyping', {
        userId: senderId,
        isTyping: false
      });
    }
  }

  private updateUserOnlineStatus(userId: string, isOnline: boolean): void {
    const existingTimeout = this.userTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    this.onlineUsers.set(userId, isOnline);

    if (isOnline) {
      const timeout = setTimeout(() => {
        this.onlineUsers.set(userId, false);
        this.userTimeouts.delete(userId);
        this.broadcastOnlineUsers();
      }, this.ONLINE_TIMEOUT);

      this.userTimeouts.set(userId, timeout);
    }
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers(): void {
    const onlineUsersObject = Object.fromEntries(this.onlineUsers);
    this.server.emit('onlineUsers', onlineUsersObject);
  }

  private getUserIdFromSocket(client: Socket): string | null {
    const userId = client.handshake.auth.userId;
    return userId;
  }
}