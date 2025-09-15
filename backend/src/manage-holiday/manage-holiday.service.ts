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
    return this.prisma.$transaction(async (prisma) => {
      // First, set manageHolidayID to null in related PublicHoliday records
      await prisma.publicHoliday.updateMany({
        where: { manageHolidayID: id },
        data: { manageHolidayID: null },
      });
      
      // Then delete the ManageHoliday record
      return prisma.manageHoliday.delete({ where: { id } });
    });
  }
}
