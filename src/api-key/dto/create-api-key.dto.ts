import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}
export class CreateArrApiKeyDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  keys: string[];
}
