// import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    // private readonly httpService: HttpService,
    @InjectConnection() private readonly connection: Connection,
  ) { }


  // @Interval(10000) // Chạy mỗi 10 giây
  // checkServerStatus() {
  //   const memoryUsage = process.memoryUsage();
  //   const freemem = os.freemem();
  //   const totalmem = os.totalmem();
  //   const memoryPercentage = ((totalmem - freemem) / totalmem) * 100;

  //   const cpuUsage = process.cpuUsage();
  //   const uptime = process.uptime();

  //   this.logger.log('📊 Server Status', {
  //     pid: process.pid,
  //     uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
  //     memory: {
  //       rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
  //       heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
  //       heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
  //       external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
  //     },
  //     systemMemory: {
  //       total: `${Math.round(totalmem / 1024 / 1024)} MB`,
  //       free: `${Math.round(freemem / 1024 / 1024)} MB`,
  //       used: `${Math.round(memoryPercentage)}%`,
  //     },
  //     cpuUsage: {
  //       user: cpuUsage.user,
  //       system: cpuUsage.system,
  //     },
  //   });

  //   // 🚨 Cảnh báo nếu bộ nhớ cao
  //   if (memoryPercentage > 85) {
  //     this.logger.warn('⚠️ High Memory Usage Detected!', {
  //       memoryPercentage: `${Math.round(memoryPercentage)}%`,
  //       freeMemory: `${Math.round(freemem / 1024 / 1024)} MB`,
  //     });
  //   }
  // }

  
  // Cron job chạy mỗi 10 phút
  // @Cron('*/11 * * * *')
  // async handleCron() {
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get('https://apple-macstore.onrender.com/categories'),
  //     );
  //   } catch (error) {
  //   }
  // }
}
