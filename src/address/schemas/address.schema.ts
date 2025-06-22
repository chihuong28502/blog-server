import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.id;
      return ret;
    }
  }
 })
export class Address {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string; // ID của người dùng, liên kết với bảng User

  @Prop({ required: true })
  fullName: string; // Tên đầy đủ của người nhận hàng

  @Prop({ required: true })
  phoneNumber: string; // Số điện thoại của người nhận hàng

  @Prop({ required: true })
  addressLine: string; // Dòng địa chỉ chính (số nhà, tên đường)

  @Prop({ required: true })
  city: string; // Thành phố

  @Prop({ required: true })
  district: string; // Quận/Huyện

  @Prop({ required: true })
  ward: string; // Phường/Xã

  @Prop({ default: 'Vietnam' })
  country: string;

  @Prop({ default: false })
  isDefault: boolean; // Đánh dấu địa chỉ mặc định
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// 📌 Index tối ưu hóa truy vấn
AddressSchema.index({ userId: 1 });
AddressSchema.index({ userId: 1, isDefault: 1, type: 1 });
