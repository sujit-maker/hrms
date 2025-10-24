import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReimbursementDto } from './dto/create-reimbursement.dto';
import { UpdateReimbursementDto } from './dto/update-reimbursement.dto';

@Injectable()
export class ReimbursementService {
  constructor(private readonly prisma: PrismaService) {}

  /** Include all necessary relations in queries */
  private includeRels() {
    return {
      company: true,
      branches: true,
      serviceProvider: true,
      manageEmployee: true,
      items: true, // include child line-items
    };
  }

  /** ─────────────── CREATE ─────────────── */
  async create(dto: CreateReimbursementDto) {
    const { items = [], ...parent } = dto;

    // Create parent reimbursement record
    const created = await this.prisma.reimbursement.create({
      data: parent,
      include: this.includeRels(),
    });

    // If line items exist, create them linked to reimbursementID
    if (items.length) {
      await this.prisma.reimbursementItem.createMany({
        data: items.map((i) => ({
          reimbursementID: created.id,
          reimbursementType: i.reimbursementType ?? null,
          amount: i.amount ?? null,
          description: i.description ?? null,
        })),
      });
    }

    return this.findOne(created.id);
  }

  /** Bulk create multiple parent reimbursements */
  async createMany(dtos: CreateReimbursementDto[]) {
    return this.prisma.reimbursement.createMany({ data: dtos });
  }

  /** ─────────────── READ ─────────────── */
  async findAll() {
    return this.prisma.reimbursement.findMany({
      include: this.includeRels(),
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const rec = await this.prisma.reimbursement.findUnique({
      where: { id },
      include: this.includeRels(),
    });
    if (!rec) throw new NotFoundException(`Reimbursement id ${id} not found`);
    return rec;
  }

  async findByEmployee(empId: number) {
    return this.prisma.reimbursement.findMany({
      where: { manageEmployeeID: empId },
      include: this.includeRels(),
      orderBy: { date: 'desc' },
    });
  }

  async findByCompany(companyID: number) {
    return this.prisma.reimbursement.findMany({
      where: { companyID },
      include: this.includeRels(),
      orderBy: { date: 'desc' },
    });
  }

  /** ─────────────── UPDATE ─────────────── */
  async update(id: number, dto: UpdateReimbursementDto) {
    const { items, ...parent } = dto;

    await this.ensureExists(id);

    // Transaction ensures parent & items stay consistent
    await this.prisma.$transaction(async (tx) => {
      // Update parent reimbursement
      await tx.reimbursement.update({
        where: { id },
        data: parent,
      });

      // If items array provided, replace all existing line items
      if (items) {
        await tx.reimbursementItem.deleteMany({ where: { reimbursementID: id } });
        if (items.length) {
          await tx.reimbursementItem.createMany({
            data: items.map((i) => ({
              reimbursementID: id,
              reimbursementType: i.reimbursementType ?? null,
              amount: i.amount ?? null,
              description: i.description ?? null,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  /** ─────────────── DELETE ─────────────── */
  async remove(id: number) {
    await this.ensureExists(id);

    // Delete child items first, then parent
    await this.prisma.reimbursementItem.deleteMany({
      where: { reimbursementID: id },
    });

    return this.prisma.reimbursement.delete({
      where: { id },
      include: this.includeRels(),
    });
  }

  /** ─────────────── UTILS ─────────────── */
  private async ensureExists(id: number) {
    const ok = await this.prisma.reimbursement.findUnique({ where: { id } });
    if (!ok) throw new NotFoundException(`Reimbursement id ${id} not found`);
  }
}
