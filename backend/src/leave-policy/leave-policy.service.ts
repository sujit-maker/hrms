import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';

@Injectable()
export class LeavePolicyService {
  constructor(private prisma: PrismaService) {}

  create(createLeavePolicyDto: CreateLeavePolicyDto) {
    return this.prisma.leavePolicy.create({
      data: createLeavePolicyDto,
    });
  }

  findAll() {
    return this.prisma.leavePolicy.findMany({
      include: {
        company: true,
        branches: true,
        serviceProvider: true,
        leavePolicyHoliday: true,
        manageEmployee: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.leavePolicy.findUnique({
      where: { id },
      include: {
        company: true,
        branches: true,
        serviceProvider: true,
        leavePolicyHoliday: true,
        manageEmployee: true,
      },
    });
  }

  update(id: number, updateLeavePolicyDto: UpdateLeavePolicyDto) {
    return this.prisma.leavePolicy.update({
      where: { id },
      data: updateLeavePolicyDto,
    });
  }

  remove(id: number) {
    return this.prisma.leavePolicy.delete({
      where: { id },
    });
  }
}
