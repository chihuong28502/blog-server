import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @ApiProperty({ example: 'Tiêu đề bài viết' })
  name: string;

  @ApiProperty({ example: 'Mô tả ngắn về bài viết' })
  description?: string;

  @ApiProperty({ example: 'Nội dung chi tiết bài viết' })
  content?: string;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'] })
  images?: string[];

  @ApiProperty({
    example: {
      _id: '507f1f77bcf86cd799439011',
      name: 'Công nghệ',
      description: 'Danh mục công nghệ'
    }
  })
  category: {
    _id: string;
    name: string;
    description?: string;
  };

  @ApiProperty({
    example: {
      _id: '507f1f77bcf86cd799439012',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      email: 'user@example.com'
    }
  })
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
} 