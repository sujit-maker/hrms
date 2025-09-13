import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';

@Injectable()
export class LeaveApplicationService {
  constructor(private prisma: PrismaService) {}

  create(createLeaveApplicationDto: CreateLeaveApplicationDto) {
    return this.prisma.leaveApplication.create({
      data: createLeaveApplicationDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  findAll() {
    return this.prisma.leaveApplication.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.leaveApplication.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  update(id: number, updateLeaveApplicationDto: UpdateLeaveApplicationDto) {
    return this.prisma.leaveApplication.update({
      where: { id },
      data: updateLeaveApplicationDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.leaveApplication.delete({
      where: { id },
    });
  }
}
