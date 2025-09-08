import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDetailsDto } from './dto/create-bank-detail.dto';
import { UpdateBankDetailsDto } from './dto/update-bank-detail.dto';

@Injectable()
export class BankDetailsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateBankDetailsDto) {
    return this.prisma.bankDetails.create({ data });
  }

  findAll() {
    return this.prisma.bankDetails.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.bankDetails.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
      },
    });
  }

  update(id: number, data: UpdateBankDetailsDto) {
    return this.prisma.bankDetails.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.bankDetails.delete({ where: { id } });
  }
}
