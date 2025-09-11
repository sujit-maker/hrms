import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateContractorDto) {
    return this.prisma.contractors.create({ data });
  }

  // contractors.service.ts
findAll() {
  return this.prisma.contractors.findMany({
    orderBy: { id: 'desc' },
    include: { serviceProvider: true, company: true, branches: true }, // <-- add this
  });
}


  findOne(id: number) {
    return this.prisma.contractors.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateContractorDto) {
    return this.prisma.contractors.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.contractors.delete({ where: { id } });
  }
}
