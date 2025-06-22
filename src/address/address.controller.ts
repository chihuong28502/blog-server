import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ResponseMessage } from '@/common/decorators/response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  @ResponseMessage('Tạo địa chỉ thành công')
  async create(@CurrentUser() user: any, @Body() createAddressDto: CreateAddressDto) {
    return await this.addressService.create(user._id, createAddressDto);
  }

  @Get()
  @ResponseMessage('Lấy danh sách địa chỉ thành công')
  async findAllById(@CurrentUser() user: any) {
    const result = await this.addressService.findAllById(user._id);
    return result
  }

  @Get(':id')
  @ResponseMessage('Lấy địa chỉ thành công')
  async findOne(@Param('id') id: string) {
    const result = await this.addressService.findOne(id);
    return result
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật địa chỉ thành công')
  async update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    const result = await this.addressService.update(id, updateAddressDto);
    return result
  }

  @Delete(':id')
  @ResponseMessage('Xóa địa chỉ thành công')
  async remove(@Param('id') id: string) {
    return await this.addressService.remove(id);
  }
}
