import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';

@Injectable()
export class LeavePolicyService {
  constructor(private prisma: PrismaService) {}

  async create(createLeavePolicyDto: CreateLeavePolicyDto) {
    return this.prisma.leavePolicy.create({
      data: createLeavePolicyDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
      },
    });
  }

  async findAll() {
    return this.prisma.leavePolicy.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
      },
    });
  }

  async findOne(id: number) {
    const leavePolicy = await this.prisma.leavePolicy.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
      },
    });

    if (!leavePolicy) {
      throw new NotFoundException(`Leave policy with ID ${id} not found`);
    }

    return leavePolicy;
  }

  async update(id: number, updateLeavePolicyDto: UpdateLeavePolicyDto) {
    const leavePolicy = await this.findOne(id);
    
    return this.prisma.leavePolicy.update({
      where: { id },
      data: updateLeavePolicyDto,
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
      },
    });
  }

  async remove(id: number) {
    const leavePolicy = await this.findOne(id);
    
    // Delete related leavePolicyHoliday records first
    await this.prisma.leavePolicyHoliday.deleteMany({
      where: { leavePolicyID: id },
    });
    
    return this.prisma.leavePolicy.delete({
      where: { id },
    });
  }
}
