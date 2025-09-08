import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateManageHolidayDto } from './dto/create-manage-holiday.dto';
import { UpdateManageHolidayDto } from './dto/update-manage-holiday.dto';

@Injectable()
export class ManageHolidayService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateManageHolidayDto) {
    return this.prisma.manageHoliday.create({ data });
  }

  findAll() {
    return this.prisma.manageHoliday.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        publicHoliday: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.manageHoliday.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        publicHoliday: true,
      },
    });
  }

  update(id: number, data: UpdateManageHolidayDto) {
    return this.prisma.manageHoliday.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.manageHoliday.delete({ where: { id } });
  }
}
