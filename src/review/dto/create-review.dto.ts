import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;  // ID của sản phẩm

  @IsMongoId()
  @IsNotEmpty()
  user_id: string;     
  
  @IsMongoId()
  @IsNotEmpty()
  variant_id: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;      // Xếp hạng từ 1 đến 5

  @IsNotEmpty()
  review_text: string; // Nội dung đánh giá

  @IsOptional()
  is_verified_purchase?: boolean; // Có phải là đơn hàng đã mua không
}