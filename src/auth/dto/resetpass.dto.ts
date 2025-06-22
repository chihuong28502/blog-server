import { IsString, MinLength } from 'class-validator';

export class ResetPassDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}