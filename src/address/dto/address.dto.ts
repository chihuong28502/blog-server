import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  addressLine: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  country?: string = 'Vietnam';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
export class AddressResponseDto {
  _id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  district: string;
  ward: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
