import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../email.service';

@Processor('send-email')
export class EmailConsumer {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly emailService: EmailService,
  ) { }
  @Process('register')
  async register(job: Job<{ email: string; verificationUrl: string }>) {
    try {
      // Uncomment this line - it was commented out in your code
      await this.emailService.sendVerificationEmail(job.data.email, job.data.verificationUrl);
    } catch (error) {
      throw error;
    }
  }
  @Process('send-info-o2')
  async sendInfoO2(job: Job<{ email: string; password: string }>) {
    try {
      await this.emailService.sendInfoUserO2(job.data.email, job.data.password);
    } catch (error) {
      throw error;
    }
  }

  @Process('forgetPassword')
  async forgetPassword(job: Job<{ email: string; verificationUrl: string }>) {
    try {
      // Uncomment this line - it was commented out in your code
      await this.emailService.sendResetPasswordEmail(job.data.email, job.data.verificationUrl);
    } catch (error) {
      throw error;
    }
  }
}