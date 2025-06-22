import { HookGateway } from '@/common/hooks/socket.gateway';
import { RedisModule } from '@/redis/redis.module';
import { UsersModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatConversation, ChatConversationSchema } from './schemas/chat-conversation.schema';
import { ChatMessage, ChatMessageSchema } from './schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatConversation.name, schema: ChatConversationSchema },
    ]),
    UsersModule,
    RedisModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway,HookGateway],
  exports: [ChatService],
})
export class ChatModule { }