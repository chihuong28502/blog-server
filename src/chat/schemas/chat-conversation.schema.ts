import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatConversationDocument = ChatConversation & Document;

@Schema({ timestamps: true, toJSON: {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  }
}})
export class ChatConversation {
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', required: true })
  participants: string[]; // Danh sách người tham gia (2 người)

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage' })
  lastMessageId: string; // Tin nhắn cuối cùng

  @Prop({ default: false })
  isDeleted: boolean; // Trạng thái xóa (để soft delete)
}

export const ChatConversationSchema = SchemaFactory.createForClass(ChatConversation);

// Index để tối ưu truy vấn
ChatConversationSchema.index({ participants: 1 });
ChatConversationSchema.index({ createdAt: -1 });