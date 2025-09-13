import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';

@Injectable()
export class WorkShiftService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateWorkShiftDto) {
    return this.prisma.workShift.create({ data });
  }

  findAll() {
    return this.prisma.workShift.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.workShift.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  update(id: number, data: UpdateWorkShiftDto) {
    return this.prisma.workShift.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.workShift.delete({ where: { id } });
  }
}