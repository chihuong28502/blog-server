import { UploadService } from '@/upload/upload.service';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor('cloud-queue')
export class CloudConsumer {
  private readonly logger = new Logger(CloudConsumer.name);

  constructor(
    private readonly uploadService: UploadService,
    @InjectQueue('cloud-queue') private cloudQueue: Queue,
  ) {
    // Thiết lập sự kiện khi job thất bại
    this.cloudQueue.on('failed', async (job, err) => {
      this.logger.error(`Job ${job.id} thất bại lần thứ ${job.attemptsMade}: ${err.message}`);

      // Kiểm tra nếu đã thử 3 lần
      if (job.attemptsMade === 3) {
        this.logger.log(`Job ${job.id} thất bại sau 3 lần thử. Lên lịch thử lại sau 3 giờ.`);

        // Tạo một job mới với cùng dữ liệu nhưng delay 3 giờ
        const newJob = await this.cloudQueue.add(
          job.name,
          job.data,
          {
            delay: 3 * 60 * 60 * 1000, // 3 giờ tính bằng milliseconds
            attempts: 3, // Thử lại 3 lần nữa
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );

        this.logger.log(`Đã tạo job mới ${newJob.id} để thử lại sau 3 giờ`);

        // Xóa job cũ
        await job.remove();
      } else if (job.attemptsMade === 6) {
        // Sau khi đã thử tổng cộng 6 lần (3 lần đầu + 3 lần sau delay)
        this.logger.warn(`Job ${job.id} thất bại sau tổng cộng 6 lần thử. Đánh dấu thất bại cuối cùng.`);

        // Ghi log thông tin chi tiết
        this.logger.error(`Lỗi cuối cùng với dữ liệu: ${JSON.stringify(job.data)}`);

        // Xóa job sau khi thất bại hoàn toàn
        await job.remove();
      }
    });
  }

  @Process('delete-upload')
  async deleteImageUpload(job: Job<{ publicId: string }>) {
    try {
      this.logger.log(`Đang xóa file với publicId: ${job.data.publicId}`);
      await this.uploadService.deleteFile(job.data.publicId);
      this.logger.log(`Đã xóa thành công file với publicId: ${job.data.publicId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa file: ${error.message}`);
      throw error;
    }
  }

  @Process('delete-uploads')
  async deleteImagesUploads(job: Job<{ publicIds: string[] }>) {
    try {
      this.logger.log(`Đang xóa ${job.data.publicIds.length} files`);
      await this.uploadService.deleteFiles(job.data.publicIds);
      this.logger.log(`Đã xóa thành công nhiều file với publicId: ${job.data.publicIds}`);
    } catch (error) {
      this.logger.error(`Lỗi khi xóa nhiều files: ${error.message}`);
      throw error;
    }
  }
}