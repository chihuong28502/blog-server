import { RedisService } from '@/redis/redis.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model } from 'mongoose';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address, AddressDocument } from './schemas/address.schema';

@Injectable()
export class AddressService {
  private readonly CACHE_TTL = 3600; // Thời gian sống của cache (1 giờ)
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService
  ) { }

  // ✅ Tạo địa chỉ mới với transaction
  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();
    try {
      // Nếu địa chỉ mới là mặc định, phải bỏ cờ mặc định của địa chỉ cũ
      if (createAddressDto.isDefault) {
        await this.addressModel.updateMany(
          { userId, isDefault: true },
          { isDefault: false },
          { session }
        );
      }

      const address = new this.addressModel({
        ...createAddressDto,
        userId
      });
      await address.save({ session });
      await this.redisService.clearAllCacheAddress();
      await session.commitTransaction();
      session.endSession();
      return address;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Lỗi khi tạo địa chỉ');
    }
  }

  async findAllById(userId: string): Promise<Address[]> {
    const key = `address_${userId}`;
    const cachedAddresses = await this.redisService.getCache<Address[]>(key);
    if (cachedAddresses) {
      return cachedAddresses;
    }
    try {
      const address = await this.addressModel.find({ userId }).select('-createdAt -updatedAt').exec();
      await this.redisService.setCache(key, address, this.CACHE_TTL);

      return address
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách địa chỉ');
    }
  }

  async findOne(id: string): Promise<Address> {
    const key = `address_${id}`;
    const cachedAddresses = await this.redisService.getCache<Address>(key);
    if (cachedAddresses) {
      return cachedAddresses;
    }
    try {
      const address = await this.addressModel.findById(id).exec();
      if (!address) {
        throw new NotFoundException('Địa chỉ không tồn tại');
      }
      await this.redisService.setCache(key, address, this.CACHE_TTL);
      return address;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy địa chỉ');
    }
  }

  async update(id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();
    try {
      const address = await this.addressModel.findById(id).exec();
      if (!address) {
        throw new NotFoundException('Địa chỉ không tồn tại');
      }

      // Nếu cập nhật địa chỉ mặc định, phải bỏ cờ mặc định của địa chỉ cũ
      if (updateAddressDto.isDefault) {
        await this.addressModel.updateMany(
          { userId: address.userId, isDefault: true },
          { isDefault: false },
          { session }
        );
      }

      const updatedAddress = await this.addressModel.findByIdAndUpdate(id, updateAddressDto, { new: true, session }).exec();
      if (!updatedAddress) {
        throw new NotFoundException('Địa chỉ không tồn tại');
      }
      await this.redisService.clearAllCacheAddress();
      await session.commitTransaction();
      session.endSession();
      return updatedAddress;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new InternalServerErrorException('Lỗi khi cập nhật địa chỉ');
    }
  }

  async remove(id: string): Promise<{ success: boolean }> {
    try {
      await this.redisService.clearAllCacheAddress();
      await this.addressModel.findByIdAndDelete(id).exec();
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa địa chỉ');
    }
  }

}
