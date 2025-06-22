import { Category } from '@/category/schemas/category.schema';
import { User } from '@/user/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ trim: true })
  content: string;

  @Prop({ default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  category: Types.ObjectId | Category;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId | User;

  @Prop({ default: 0, min: 0 })
  views: number;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ trim: true, maxlength: 160 })
  metaDescription: string;

  @Prop({ trim: true, maxlength: 60 })
  metaTitle: string;

  @Prop({ trim: true, lowercase: true, index: true })
  slug: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Tạo index cho tìm kiếm text
PostSchema.index({ 
  name: 'text', 
  description: 'text', 
  content: 'text' 
}, { 
  weights: { 
    name: 10, 
    description: 5, 
    content: 1 
  } 
});

// Index cho tìm kiếm theo danh mục và người dùng
PostSchema.index({ category: 1, createdAt: -1 });
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ isPublished: 1, createdAt: -1 });
PostSchema.index({ isFeatured: 1, createdAt: -1 });
PostSchema.index({ slug: 1 }, { unique: true, sparse: true });
