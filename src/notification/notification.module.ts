import { CloudConsumer } from '@/consumers/cloud.consumer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'cloud-queue',
      useFactory: () => ({
        defaultJobOptions: {
          removeOnFail: false
        },
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService,CloudConsumer],
})
export class NotificationModule { }
