import { ROLE } from '@/common/enums/role.enum';
import {
  Body, Controller, Delete, Get, Param,
  Post,
  Put,
  Query, UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response.decorator';
import { Role } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/roles.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  @Public()
  @Role(ROLE.ADMIN)
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
  @ResponseMessage('Tạo danh mục thành công')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách danh mục' })
  @ResponseMessage('Lấy tất cả danh mục thành công')
  findAll(@Query() query: any): Promise<{ categories: Category[] }> {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy danh mục theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin danh mục' })
  @ResponseMessage('Lấy thông tin danh mục thành công')
  findById(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }

  @Put(':id')
  @Role(ROLE.ADMIN)
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật danh mục thành công' })
  @ResponseMessage('Cập nhật danh mục thành công')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Role(ROLE.ADMIN)
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa danh mục thành công' })
  @ResponseMessage('Xóa danh mục kèm các danh mục con thành công')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.categoryService.remove(id);
  }
}