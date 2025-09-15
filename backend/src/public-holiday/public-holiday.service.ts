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
    return this.prisma.$transaction(async (prisma) => {
      // First delete all related leavePolicyHoliday records
      await prisma.leavePolicyHoliday.deleteMany({
        where: { publicHolidayID: id },
      });
      
      // Then delete the PublicHoliday record
      return prisma.publicHoliday.delete({ where: { id } });
    });
  }
}
