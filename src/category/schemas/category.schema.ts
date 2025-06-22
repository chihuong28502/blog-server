import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  order: number; // Thứ tự hiển thị

  @Prop()
  image: string;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;
  
  @Prop()
  metaKeywords: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Tạo index để tối ưu truy vấn
CategorySchema.index({ slug: 1 });
CategorySchema.index({ order: 1 });
CategorySchema.index({ isActive: 1 });

// Index phức hợp cho việc tìm kiếm danh mục hiển thị trong menu
CategorySchema.index({ isActive: 1, showInMenu: 1, order: 1 });