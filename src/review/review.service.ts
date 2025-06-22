import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewService {
  private readonly CACHE_TTL = 3600; // Thời gian sống của cache (1 giờ)

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private readonly redisService: RedisService,
  ) { }

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const session = await this.reviewModel.db.startSession();
    session.startTransaction();

    try {
      const newReview = new this.reviewModel({
        ...createReviewDto,
        product_id: new Types.ObjectId(createReviewDto.product_id),
        user_id: new Types.ObjectId(createReviewDto.user_id),
        variant_id: createReviewDto.variant_id ? new Types.ObjectId(createReviewDto.variant_id) : null
      });

      const savedReview = await newReview.save({ session });

      // Gửi đánh giá mới đến tất cả client
      // this.reviewsGateway.sendReview(savedReview);

      // Xóa cache liên quan
      await this.redisService.clearAllCacheReviews();

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return savedReview;
    } catch (error) {
      await session.abortTransaction(); // Rollback nếu có lỗi
      session.endSession();
      throw new Error('Failed to create review: ' + error.message);
    }
  }

  async findAll(): Promise<Review[]> {
    const cacheKey = 'reviews_all';

    // Kiểm tra cache trước
    const cachedReviews = await this.redisService.getCache<Review[]>(cacheKey);
    if (cachedReviews) {
      return cachedReviews
    }
    try {
      const reviews = await this.reviewModel.find().lean().exec();
      // Lưu vào cache
      await this.redisService.setCache(cacheKey, reviews, this.CACHE_TTL);
      return reviews
    } catch (error) {
      throw new Error('Lấy danh sách đánh giá thất bại: ' + error.message);
    }
  }

  async findReviewById(id: string): Promise<Review> {
    const cacheKey = `review_${id}`;

    // Kiểm tra cache trước
    const cachedReview = await this.redisService.getCache<Review>(cacheKey);
    if (cachedReview) {
      return cachedReview
    }

    try {
      const review = await this.reviewModel.findById(id).lean().exec();

      if (review) {
        // Lưu vào cache
        await this.redisService.setCache(cacheKey, review, this.CACHE_TTL);

        return review
      } else {
        throw new Error('Không tìm thấy đánh giá');
      }
    } catch (error) {
      throw new Error('Lấy đánh giá thất bại: ' + error.message);
    }
  }

  async updateReview(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const session = await this.reviewModel.db.startSession();
    session.startTransaction();

    try {
      const updatedReview = await this.reviewModel.findByIdAndUpdate(
        id,
        updateReviewDto,
        { new: true, session } // Thêm session vào update
      ).lean().exec();

      if (!updatedReview) {
        throw new Error('Không tìm thấy đánh giá');
      }

      // Xóa cache liên quan
      await this.redisService.clearAllCacheReviews();
      await this.redisService.clearCache(`review_${id}`);

      await session.commitTransaction();
      session.endSession();

      return updatedReview;
    } catch (error) {
      await session.abortTransaction(); // Rollback nếu có lỗi
      session.endSession();
      throw new Error('Có lỗi xảy ra khi cập nhật đánh giá: ' + error.message);
    }
  }

  async deleteReview(id: string): Promise<Review> {
    const session = await this.reviewModel.db.startSession();
    session.startTransaction();

    try {
      const deletedReview = await this.reviewModel.findByIdAndDelete(id, { session }).lean().exec();

      if (!deletedReview) {
        throw new Error('Không tìm thấy đánh giá');
      }

      // Xóa cache liên quan
      await this.redisService.clearAllCacheReviews();
      await this.redisService.clearCache(`review_${id}`);

      await session.commitTransaction();
      session.endSession();

      return deletedReview;
    } catch (error) {
      await session.abortTransaction(); // Rollback nếu có lỗi
      session.endSession();
      throw new Error('Có lỗi xảy ra khi xóa đánh giá: ' + error.message);
    }
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    const cacheKey = `reviews_product_${productId}`;
    // Kiểm tra cache trước
    const cachedReviews = await this.redisService.getCache<Review[]>(cacheKey);
    if (cachedReviews) {
      return cachedReviews
    }
    try {
      const reviews = await this.reviewModel.find({ product_id: new Types.ObjectId(productId) })
        .populate({
          path: 'user_id', // Lấy thông tin người dùng
          select: 'name email', // Chỉ lấy trường name và email
        })
        .populate({
          path: 'product_id', // Lấy thông tin sản phẩm
          select: 'name', // Chỉ lấy tên sản phẩm
        })
        .populate({
          path: 'variant_id', // Lấy thông tin biến thể
          select: 'color ram ssd ', // Chỉ lấy thông tin màu sắc, RAM, SSD
        }).lean().exec();
      await this.redisService.setCache(cacheKey, reviews, this.CACHE_TTL);
      return reviews
    } catch (error) {
      throw new Error('Có lỗi xảy ra khi tìm kiếm đánh giá: ' + error.message);
    }
  }
}