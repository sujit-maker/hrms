import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchesDto } from './dto/create-branch.dto';
import { UpdateBranchesDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBranchesDto) {
    return this.prisma.branches.create({ data });
  }

  findAll() {
    return this.prisma.branches.findMany({
      include: {
        serviceProvider: true,
        company: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.branches.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
      },
    });
  }

  update(id: number, data: UpdateBranchesDto) {
    return this.prisma.branches.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.branches.delete({ where: { id } });
  }
}
