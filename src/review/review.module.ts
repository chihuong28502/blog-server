import { RedisModule } from '@/redis/redis.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './review.controller';
import { ReviewService } from './review.service';
import { Review, ReviewSchema } from './schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
    ]),
    RedisModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewService],
})
export class ReviewModule { }
