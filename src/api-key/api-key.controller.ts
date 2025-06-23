import {
  Body,
  Controller,
  Get,
  Logger,
  Post
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto, CreateArrApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  private readonly logger = new Logger(ApiKeyController.name);

  constructor(private readonly apiKeyService: ApiKeyService) {}
  //chỉ admin mới dc thêm apiKey
  @Post('/create')
  async create(@Body() createApiKeyDto: CreateApiKeyDto) {
    this.logger.log(`Creating new API key`);
    return this.apiKeyService.create(createApiKeyDto);
  }

  @Post('/create-multi')
  async createMulti(@Body() createArrApiKeyDto: CreateArrApiKeyDto) {
    this.logger.log(`Creating new API key`);
    return this.apiKeyService.createMulti(createArrApiKeyDto);
  }

  @Get()
  async findAll() {
    return this.apiKeyService.findAll();
  }
}
