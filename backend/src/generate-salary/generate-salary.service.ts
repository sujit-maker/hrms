// src/generate-salary/generate-salary.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenerateSalaryDto } from './dto/create-generate-salary.dto';
import { UpdateGenerateSalaryDto } from './dto/update-generate-salary.dto';

@Injectable()
export class GenerateSalaryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGenerateSalaryDto) {
    const {
      serviceProviderID,
      companyID,
      branchesID,
      employeeID,
      monthPeriod,
    } = dto;

    return this.prisma.generateSalary.create({
      data: {
        serviceProviderID: serviceProviderID ?? null,
        companyID: companyID ?? null,
        branchesID: branchesID ?? null,
        employeeID, 
        monthPeriod:monthPeriod
      },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  findAll() {
    return this.prisma.generateSalary.findMany({
      orderBy: { id: 'desc' },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.generateSalary.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  update(id: number, dto: UpdateGenerateSalaryDto) {
    const {
      serviceProviderID,
      companyID,
      branchesID,
      employeeID,
    } = dto;

    return this.prisma.generateSalary.update({
      where: { id },
      data: {
        serviceProviderID,
        companyID,
        branchesID,
        employeeID,
      },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        manageEmployee: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.generateSalary.delete({ where: { id } });
  }
}
