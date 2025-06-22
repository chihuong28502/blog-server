import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response.decorator';
import { Role } from '@/common/decorators/roles.decorator';
import { ROLE } from '@/common/enums/role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ResponseMessage('Lấy danh sách cuộc hội thoại thành công')
  async getConversations(@CurrentUser() user: any) {
    const conversations = await this.chatService.getConversationsByUser(user._id);
    return { conversations };
  }

  @Get('conversation/:id/messages')
  @ResponseMessage('Lấy danh sách tin nhắn thành công')
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const messages = await this.chatService.getMessagesByConversation(conversationId, page, limit);
    return { messages };
  }

  @Post('message')
  @ResponseMessage('Gửi tin nhắn thành công')
  async sendMessage(
    @CurrentUser() user: any,
    @Body() payload: { receiverId: string; content: string },
  ) {
    const message = await this.chatService.createMessage(user._id, payload.receiverId, payload.content);
    return { message };
  }

  @Post('message/:id/read')
  @ResponseMessage('Đánh dấu tin nhắn đã đọc thành công')
  async markMessageAsRead(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
  ) {
    const message = await this.chatService.markMessageAsRead(messageId, user._id);
    return { message };
  }

  @Post('conversation/:id/read-all')
  @ResponseMessage('Đánh dấu tất cả tin nhắn đã đọc thành công')
  async markAllMessagesAsRead(
    @CurrentUser() user: any,
    @Param('id') conversationId: string,
  ) {
    const result = await this.chatService.markAllMessagesAsRead(conversationId, user._id);
    return result;
  }

   @Role(ROLE.ADMIN)
  @Delete('message/:id')
  @ResponseMessage('Xóa tin nhắn thành công')
  async deleteMessage(
    @CurrentUser() user: any,
    @Param('id') messageId: string,
  ) {
    return await this.chatService.deleteMessage(messageId, user._id);
  }

  @Get('unread-count')
  @ResponseMessage('Lấy số tin nhắn chưa đọc thành công')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.chatService.countUnreadMessages(user._id);
    return { count };
  }
}