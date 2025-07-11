import { ROLE } from '@/common/enums/role.enum';
import {
  Body, Controller, Delete, Get, Param,
  Post,
  Put,
  Query, UseGuards
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@Controller('categories')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @Public()
  @Role(ROLE.ADMIN)
  @ResponseMessage('Tạo danh mục thành công')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy tất cả danh mục thành công')
  findAll(@Query() query: any): Promise<{ categories: Category[] }> {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy thông tin danh mục thành công')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  @Role(ROLE.ADMIN)
  @ResponseMessage('Cập nhật danh mục thành công')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Role(ROLE.ADMIN)
  @ResponseMessage('Xóa danh mục kèm các danh mục con thành công')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.categoryService.remove(id);
  }
}