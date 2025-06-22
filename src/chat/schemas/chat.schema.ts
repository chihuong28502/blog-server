import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true, toJSON: {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  }
}})
export class ChatMessage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: string; // Người gửi tin nhắn

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  receiverId: string; // Người nhận tin nhắn

  @Prop({ required: true })
  content: string; // Nội dung tin nhắn

  @Prop({ default: false })
  isRead: boolean; // Trạng thái đọc

  @Prop({ default: false })
  isDeleted: boolean; // Trạng thái xóa (để soft delete)
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Index để tối ưu truy vấn
ChatMessageSchema.index({ senderId: 1, receiverId: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ isRead: 1 });