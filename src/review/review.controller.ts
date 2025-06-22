import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post('create')
  async create(@Res() res: Response, @Body() createReviewDto: CreateReviewDto) {
    return await this.reviewService.createReview(createReviewDto);
  }

  @Get('getById/:id')
  async findReviewById(@Res() res: Response, @Param('id') id: string) {
    return await this.reviewService.findReviewById(id);;
  }

  @Patch('update/:id')
  async update(@Res() res: Response, @Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return await this.reviewService.updateReview(id, updateReviewDto);
  }

  @Delete('delete/:id')
  async delete(@Res() res: Response, @Param('id') id: string) {
    return await this.reviewService.deleteReview(id);
  }

  @Get(':productId')
  async getReviewsByProduct(@Res() res: Response, @Param('productId') productId: string) {
    return await this.reviewService.getReviewsByProduct(productId);
  }
}