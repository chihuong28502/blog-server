import { HookGateway } from '@/common/hooks/socket.gateway';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatConversation, ChatConversationDocument } from './schemas/chat-conversation.schema';
import { ChatMessage, ChatMessageDocument } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(ChatConversation.name) private chatConversationModel: Model<ChatConversationDocument>,
    private hookGateway: HookGateway
  ) { }

  // Tạo tin nhắn mới
  async createMessage(senderId: string, receiverId: string, content: string): Promise<{
    message: ChatMessage,
    conversationId: ChatConversation
  }> {
    // Kiểm tra xem cuộc hội thoại đã tồn tại chưa
    let conversation: any = await this.findOrCreateConversation(senderId, receiverId);

    // Tạo tin nhắn mới
    const newMessage = new this.chatMessageModel({
      senderId,
      receiverId,
      content,
      isRead: false,
    });

    const savedMessage = await newMessage.save();

    // Cập nhật lastMessageId trong conversation
    await this.chatConversationModel.findByIdAndUpdate(
      conversation._id,
      { lastMessageId: savedMessage._id },
    );
    this.hookGateway.clearKeys('conversations')

    return {
      message: savedMessage,
      conversationId: conversation._id
    }
  }

  // Tìm hoặc tạo cuộc hội thoại giữa hai người dùng
  async findOrCreateConversation(userId1: string, userId2: string): Promise<ChatConversation> {
    // Tìm cuộc hội thoại theo hai người dùng (không quan tâm thứ tự)
    const conversation = await this.chatConversationModel.findOne({
      participants: { $all: [userId1, userId2] },
      isDeleted: false,
    });

    if (conversation) {
      return conversation;
    }

    // Nếu không tìm thấy, tạo cuộc hội thoại mới
    const newConversation = new this.chatConversationModel({
      participants: [userId1, userId2],
    });

    return newConversation.save();
  }

  // Lấy danh sách tin nhắn của một cuộc hội thoại
  async getMessagesByConversation(conversationId: string, page = 1, limit = 20): Promise<ChatMessage[]> {
    const conversation = await this.chatConversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const skip = (page - 1) * limit;
    const messages = await this.chatMessageModel.find({
      $or: [
        { senderId: conversation.participants[0], receiverId: conversation.participants[1] },
        { senderId: conversation.participants[1], receiverId: conversation.participants[0] },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'firstName lastName email').select(' -updatedAt')
      .exec();

    return messages.reverse(); // Sắp xếp theo thời gian tăng dần
  }

  // Lấy tất cả cuộc hội thoại của một người dùng
  async getConversationsByUser(userId: string): Promise<ChatConversation[]> {
    const conversations = await this.chatConversationModel.find({
      participants: userId,
      isDeleted: false,
    })
      .populate('participants', 'firstName lastName email')
      .populate({
        path: 'lastMessageId',
        select: 'content createdAt isRead',
      }).select('-createdAt -updatedAt')
      .sort({ updatedAt: -1 })
      .exec();

    return conversations;
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessageAsRead(messageId: string, userId: string): Promise<ChatMessage> {
    const message = await this.chatMessageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Kiểm tra xem người yêu cầu đánh dấu đã đọc có phải là người nhận không
    if (message.receiverId.toString() !== userId) {
      throw new BadRequestException('Only receiver can mark message as read');
    }

    message.isRead = true;
    return message.save();
  }

  // Đánh dấu tất cả tin nhắn trong cuộc hội thoại là đã đọc
  async markAllMessagesAsRead(conversationId: string, userId: string): Promise<{ success: boolean, count: number }> {
    const conversation = await this.chatConversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Kiểm tra xem người dùng có thuộc về cuộc hội thoại này không
    if (!conversation.participants.includes(new Types.ObjectId(userId) as any)) {
      throw new BadRequestException('User is not part of this conversation');
    }

    // Đánh dấu tất cả tin nhắn gửi đến người dùng là đã đọc
    const result = await this.chatMessageModel.updateMany(
      {
        receiverId: userId,
        isRead: false,
        isDeleted: false,
      },
      { isRead: true },
    );

    return { success: true, count: result.modifiedCount };
  }

  // Xóa một tin nhắn (soft delete)
  async deleteMessage(messageId: string, userId: string): Promise<{ success: boolean }> {
    const message = await this.chatMessageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Kiểm tra xem người yêu cầu xóa có phải là người gửi không
    if (message.senderId.toString() !== userId) {
      throw new BadRequestException('Only sender can delete message');
    }

    message.isDeleted = true;
    await message.save();

    return { success: true };
  }

  // Đếm số tin nhắn chưa đọc của một người dùng
  async countUnreadMessages(userId: string): Promise<number> {
    return this.chatMessageModel.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    });
  }
}