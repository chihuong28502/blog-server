import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Tiêu đề bài viết' })
  @IsString({ message: 'Tên bài viết phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên bài viết không được để trống' })
  @MaxLength(200, { message: 'Tên bài viết không được vượt quá 200 ký tự' })
  name: string;

  @ApiProperty({ example: 'Mô tả ngắn về bài viết', required: false })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;

  @ApiProperty({ example: 'Nội dung chi tiết bài viết', required: false })
  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content?: string;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsOptional()
  @IsArray({ message: 'Hình ảnh phải là mảng' })
  @IsString({ each: true, message: 'Mỗi hình ảnh phải là chuỗi' })
  images?: string[];

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString({ message: 'ID danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'ID danh mục không được để trống' })
  category: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString({ message: 'ID người dùng phải là chuỗi' })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  user: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Số lượt xem phải là số' })
  @Min(0, { message: 'Số lượt xem không được nhỏ hơn 0' })
  views?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là boolean' })
  isPublished?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái nổi bật phải là boolean' })
  isFeatured?: boolean;

  @ApiProperty({ example: ['javascript', 'nodejs', 'tutorial'], required: false })
  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi tag phải là chuỗi' })
  tags?: string[];

  @ApiProperty({ example: 'Mô tả meta cho SEO', required: false })
  @IsOptional()
  @IsString({ message: 'Meta description phải là chuỗi' })
  @MaxLength(160, { message: 'Meta description không được vượt quá 160 ký tự' })
  metaDescription?: string;

  @ApiProperty({ example: 'Tiêu đề meta cho SEO', required: false })
  @IsOptional()
  @IsString({ message: 'Meta title phải là chuỗi' })
  @MaxLength(60, { message: 'Meta title không được vượt quá 60 ký tự' })
  metaTitle?: string;

  @ApiProperty({ example: 'tieu-de-bai-viet', required: false })
  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi' })
  slug?: string;
}
