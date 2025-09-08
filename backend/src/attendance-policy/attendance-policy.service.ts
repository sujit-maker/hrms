import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAttendancePolicyDto } from './dto/create-attendance-policy.dto';
import { UpdateAttendancePolicyDto } from './dto/update-attendance-policy.dto';

@Injectable()
export class AttendancePolicyService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAttendancePolicyDto) {
    return this.prisma.attendancePolicy.create({ data });
  }

  findAll() {
    return this.prisma.attendancePolicy.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.attendancePolicy.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
      },
    });
  }

  update(id: number, data: UpdateAttendancePolicyDto) {
    return this.prisma.attendancePolicy.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.attendancePolicy.delete({ where: { id } });
  }
}
