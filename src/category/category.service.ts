import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) { }

  // Tạo danh mục mới
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      // Tạo slug từ tên danh mục
      const slug = this.generateSlug(createCategoryDto.name);
      
      // Kiểm tra slug đã tồn tại chưa
      const existingCategory = await this.categoryModel.findOne({ slug }).exec();
      if (existingCategory) {
        throw new BadRequestException(`Danh mục với slug "${slug}" đã tồn tại`);
      }

      // Nếu không có order, lấy order lớn nhất + 1
      if (!createCategoryDto.order) {
        const lastCategory = await this.categoryModel.findOne()
          .sort({ order: -1 })
          .select('order')
          .lean()
          .exec();
        createCategoryDto.order = (lastCategory?.order || 0) + 1;
      }

      // Tạo danh mục mới
      const newCategory = new this.categoryModel({
        ...createCategoryDto,
        slug,
      });

      const data = await newCategory.save();
      return data.toObject();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Không thể tạo danh mục: ${error.message}`);
    }
  }

  // Lấy tất cả danh mục
  async findAll(query: any = {}): Promise<{ categories: Category[] }> {
    try {
      const categories = await this.categoryModel.find({
        isActive: true,
        ...query
      })
      .sort({ order: 1 })
      .exec();
      
      return {
        categories
      };
    } catch (error) {
      throw new BadRequestException(`Không thể lấy danh sách danh mục: ${error.message}`);
    }
  }

  // Lấy danh mục theo ID
  async findById(id: string): Promise<Category> {
    try {
      const category = await this.categoryModel.findById(id).exec();

      if (!category) {
        throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
      }

      return category.toObject();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể lấy danh mục: ${error.message}`);
    }
  }

  // Cập nhật danh mục
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.categoryModel.findById(id).exec();

      if (!category) {
        throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
      }

      // Xử lý cập nhật slug nếu tên thay đổi
      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        const newSlug = this.generateSlug(updateCategoryDto.name);
        const existingCategory = await this.categoryModel.findOne({
          slug: newSlug,
          _id: { $ne: id }
        }).exec();

        if (existingCategory) {
          throw new BadRequestException(`Danh mục với slug "${newSlug}" đã tồn tại`);
        }

        updateCategoryDto['slug'] = newSlug;
      }

      // Cập nhật danh mục
      const updatedCategory = await this.categoryModel
        .findByIdAndUpdate(id, updateCategoryDto, { new: true })
        .exec();

      return updatedCategory as Category;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể cập nhật danh mục: ${error.message}`);
    }
  }

  // Xóa danh mục
  async remove(id: string): Promise<{ success: boolean }> {
    try {
      const category = await this.categoryModel.findById(id).exec();

      if (!category) {
        throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
      }

      await this.categoryModel.findByIdAndDelete(id).exec();
      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Không thể xóa danh mục: ${error.message}`);
    }
  }

  // Các method hỗ trợ
  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,      // Chuyển thành chữ thường
      strict: true,     // Loại bỏ các ký tự đặc biệt
      locale: 'vi',     // Hỗ trợ tiếng Việt
    });
  }
}