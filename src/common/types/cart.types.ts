import { Types } from "mongoose";

export interface ICart{
  userId: string;
  items: ICartItem[];
}
export interface ICartItem {
  productId: Types.ObjectId; // id của sản phẩm
  variantId:Types.ObjectId; // id của biến thể sản phẩm
  quantity: number;
}

