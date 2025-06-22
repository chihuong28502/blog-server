import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) { }

  // Tải lên một file
  async uploadFile(file: Express.Multer.File, folder = 'store'): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            this.logger.error(`Upload error: ${error.message}`);
            return reject(new BadRequestException(`Upload thất bại: ${error.message}`));
          }

          if (!result) {
            return reject(new BadRequestException('Upload thất bại: Không nhận được kết quả từ Cloudinary'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      // Pipe the buffer to Cloudinary
      const fileStream = Readable.from(file.buffer);
      fileStream.pipe(uploadStream);
    });
  }


  // Tải lên nhiều file song song
  async uploadFiles(files: Express.Multer.File[], folder = 'store'): Promise<{ images: CloudinaryResponse[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file được tải lên');
    }
    const uploadPromises = await Promise.all(files.map((file) => this.uploadFile(file, folder)));
    return {
      images: uploadPromises
    };
  }

  // Xóa file
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      this.logger.error(`Delete error: ${error.message}`);
      throw new BadRequestException(`Xóa thất bại: ${error.message}`);
    }
  }

  // Xóa nhiều file song song
  async deleteFiles(publicIds: string[]): Promise<boolean> {
    if (!publicIds || publicIds.length === 0) {
      throw new BadRequestException('Không có mã định danh public nào được cung cấp');
    }

    try {
      const deletePromises = publicIds.map((publicId) => this.deleteFile(publicId));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      this.logger.error(`Delete files error: ${error.message}`);
      throw new BadRequestException(`Xóa thất bại: ${error.message}`);
    }
  }

  // Xóa thư mục
  async deleteFolder(folder: string): Promise<boolean> {
    try {
      const resources = await this.getFolderResources(folder);
      if (resources.length > 0) {
        const publicIds = resources.map((res) => res.public_id);
        await this.deleteFiles(publicIds);
      }

      await cloudinary.api.delete_folder(folder);
      return true;
    } catch (error) {
      this.logger.error(`Delete folder error: ${error.message}`);
      throw new BadRequestException(`Xóa thư mục thất bại: ${error.message}`);
    }
  }

  // Lấy tài nguyên trong thư mục
  async getFolderResources(folder: string): Promise<any[]> {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .max_results(500)
        .execute();
      return result.resources;
    } catch (error) {
      this.logger.error(`Get folder resources error: ${error.message}`);
      throw new BadRequestException(
        `Lấy danh sách tài nguyên thất bại: ${error.message}`,
      );
    }
  }

  // Sinh chữ ký cho API
  generateSignature(paramsToSign: any): string {
    return cloudinary.utils.api_sign_request(
      paramsToSign,
      this.configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    );
  }

  // Sinh URL upload
  generateUploadUrl(folder: string): {
    timestamp: number;
    signature: string;
    apiKey: string;
    folder: string;
  } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder,
    };
    return {
      timestamp,
      signature: this.generateSignature(params),
      apiKey: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      folder,
    };
  }
}

export interface CloudinaryResponse {
  url: string;
  publicId: string;
}
