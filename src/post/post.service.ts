import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>
  ) {}

  async create(createPostDto: CreatePostDto): Promise<PostDocument> {
    try {
      // Validate input
      if (!createPostDto.name) {
        throw new BadRequestException('Tên bài viết không được để trống');
      }
      if (!createPostDto.category) {
        throw new BadRequestException('Danh mục không được để trống');
      }
      if (!createPostDto.user) {
        throw new BadRequestException('Người dùng không được để trống');
      }

      // Tạo post mới
      const newPost = new this.postModel(createPostDto);
      const data = await newPost.save();
      return data.toObject();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi tạo bài viết');
    }
  }

  async findAll(query: any = {}): Promise<{posts:PostDocument[]}> {
    try {
      const data = await this.postModel
        .find(query)
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return { posts: data };
    } catch (error) {
      throw new InternalServerErrorException('Có lỗi xảy ra khi lấy danh sách bài viết');
    }
  }

  async findOne(id: string): Promise<{post:PostDocument}> {
    try {
      if (!id) {
        throw new BadRequestException('ID không được để trống');
      }

      const post = await this.postModel
        .findById(id)
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .lean()
        .exec();

      if (!post) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }

      return { post };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID không hợp lệ');
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi tìm bài viết');
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<{post:PostDocument}> {
    try {
      if (!id) {
        throw new BadRequestException('ID không được để trống');
      }

      const updatedPost = await this.postModel
        .findByIdAndUpdate(id, updatePostDto, { new: true })
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .lean()
        .exec();

      if (!updatedPost) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }

      return { post: updatedPost };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID không hợp lệ');
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi cập nhật bài viết');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new BadRequestException('ID không được để trống');
      }

      const result = await this.postModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }

      return { message: 'Xóa bài viết thành công' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('ID không hợp lệ');
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi xóa bài viết');
    }
  }

  async findByCategory(categoryId: string): Promise<PostDocument[]> {
    try {
      if (!categoryId) {
        throw new BadRequestException('ID danh mục không được để trống');
      }

      return await this.postModel
        .find({ category: categoryId })
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi tìm bài viết theo danh mục');
    }
  }

  async findByUser(userId: string): Promise<PostDocument[]> {
    try {
      if (!userId) {
        throw new BadRequestException('ID người dùng không được để trống');
      }

      return await this.postModel
        .find({ user: userId })
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi tìm bài viết theo người dùng');
    }
  }

  async search(keyword: string): Promise<PostDocument[]> {
    try {
      if (!keyword) {
        throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
      }

      return await this.postModel
        .find({
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { content: { $regex: keyword, $options: 'i' } }
          ]
        })
        .populate('category', 'name description')
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Có lỗi xảy ra khi tìm kiếm bài viết');
    }
  }
}
