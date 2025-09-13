import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpAttendanceRegulariseDto } from './dto/create-emp-attendance-regularise.dto';
import { UpdateEmpAttendanceRegulariseDto } from './dto/update-emp-attendance-regularise.dto';

@Injectable()
export class EmpAttendanceRegulariseService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpAttendanceRegulariseDto: CreateEmpAttendanceRegulariseDto) {
    return this.prisma.empAttendanceRegularise.create({
      data: createEmpAttendanceRegulariseDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  async findAll() {
    return this.prisma.empAttendanceRegularise.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.empAttendanceRegularise.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  async update(id: number, updateEmpAttendanceRegulariseDto: UpdateEmpAttendanceRegulariseDto) {
    return this.prisma.empAttendanceRegularise.update({
      where: { id },
      data: updateEmpAttendanceRegulariseDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.empAttendanceRegularise.delete({
      where: { id },
    });
  }
}
