import { Module } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { CalenderController } from './calender.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CalenderController],
  providers: [CalenderService,PrismaService],
})
export class CalenderModule {}
