import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, Min, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'Tên bài viết phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên bài viết không được để trống' })
  @MaxLength(200, { message: 'Tên bài viết không được vượt quá 200 ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @MaxLength(500, { message: 'Mô tả không được vượt quá 500 ký tự' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content?: string;

  @IsOptional()
  @IsArray({ message: 'Hình ảnh phải là mảng' })
  @IsString({ each: true, message: 'Mỗi hình ảnh phải là chuỗi' })
  images?: string[];

  @IsString({ message: 'ID danh mục phải là chuỗi' })
  @IsNotEmpty({ message: 'ID danh mục không được để trống' })
  category: string;

  @IsString({ message: 'ID người dùng phải là chuỗi' })
  @IsNotEmpty({ message: 'ID người dùng không được để trống' })
  user: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số lượt xem phải là số' })
  @Min(0, { message: 'Số lượt xem không được nhỏ hơn 0' })
  views?: number;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là boolean' })
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái nổi bật phải là boolean' })
  isFeatured?: boolean;

  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi tag phải là chuỗi' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Meta description phải là chuỗi' })
  @MaxLength(160, { message: 'Meta description không được vượt quá 160 ký tự' })
  metaDescription?: string;

  @IsOptional()
  @IsString({ message: 'Meta title phải là chuỗi' })
  @MaxLength(60, { message: 'Meta title không được vượt quá 60 ký tự' })
  metaTitle?: string;

  @IsOptional()
  @IsString({ message: 'Slug phải là chuỗi' })
  slug?: string;
}
