import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // required: true 
  @Prop({ type: Types.ObjectId, ref: 'Variant', required: true })
  variantId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 }) // Xếp hạng từ 1 đến 5
  rating: number;

  @Prop({ required: true })
  review_text: string;

  @Prop({ default: false }) // Có phải là đơn hàng đã mua không
  is_verified_purchase: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);