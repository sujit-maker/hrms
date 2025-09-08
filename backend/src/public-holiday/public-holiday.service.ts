import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePublicHolidayDto } from './dto/create-public-holiday.dto';
import { UpdatePublicHolidayDto } from './dto/update-public-holiday.dto';

@Injectable()
export class PublicHolidayService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePublicHolidayDto) {
    return this.prisma.publicHoliday.create({ data });
  }

  findAll() {
    return this.prisma.publicHoliday.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        manageHoliday: true,
        leavePolicyHoliday: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.publicHoliday.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        manageHoliday: true,
        leavePolicyHoliday: true,
      },
    });
  }

  update(id: number, data: UpdatePublicHolidayDto) {
    return this.prisma.publicHoliday.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.publicHoliday.delete({ where: { id } });
  }
}
