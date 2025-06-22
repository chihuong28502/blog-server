import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString({ message: 'firstName phải là chuỗi' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'lastName phải là chuỗi' })
  @IsOptional()
  lastName?: string;
}
