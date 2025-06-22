import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Posts - Quản lý bài viết')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Tạo bài viết thành công' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dữ liệu đầu vào không hợp lệ' 
  })
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả bài viết' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lấy danh sách bài viết thành công' 
  })
  async findAll() {
    return await this.postService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm bài viết theo từ khóa' })
  @ApiQuery({ name: 'keyword', description: 'Từ khóa tìm kiếm', example: 'javascript' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tìm kiếm bài viết thành công' 
  })
  async search(@Query('keyword') keyword: string) {
    return await this.postService.search(keyword);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Lấy bài viết theo danh mục' })
  @ApiParam({ name: 'categoryId', description: 'ID của danh mục' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lấy bài viết theo danh mục thành công' 
  })
  async findByCategory(@Param('categoryId') categoryId: string) {
    return await this.postService.findByCategory(categoryId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy bài viết theo người dùng' })
  @ApiParam({ name: 'userId', description: 'ID của người dùng' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lấy bài viết theo người dùng thành công' 
  })
  async findByUser(@Param('userId') userId: string) {
    return await this.postService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài viết' })
  @ApiParam({ name: 'id', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lấy thông tin bài viết thành công' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy bài viết' 
  })
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin bài viết' })
  @ApiParam({ name: 'id', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cập nhật bài viết thành công' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy bài viết' 
  })
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiParam({ name: 'id', description: 'ID của bài viết' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Xóa bài viết thành công' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Không tìm thấy bài viết' 
  })
  async remove(@Param('id') id: string) {
    return await this.postService.remove(id);
  }
}
