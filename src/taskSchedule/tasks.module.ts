import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';


@Module({
  imports: [MongooseModule.forFeature([

  ]),],
  providers: [TasksService],
})
export class TasksModule { }
