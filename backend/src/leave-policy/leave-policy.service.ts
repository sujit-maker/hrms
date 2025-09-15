import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';

@Injectable()
export class LeavePolicyService {
  constructor(private prisma: PrismaService) {}

  async create(createLeavePolicyDto: CreateLeavePolicyDto) {
    const { applicableHolidayIds, ...rest } = createLeavePolicyDto as any;

    return this.prisma.$transaction(async (prisma) => {
      const policy = await prisma.leavePolicy.create({
        data: rest,
        include: {
          serviceProvider: true,
          company: true,
          branches: true,
        },
      });

      // Link selected holidays via PublicHoliday table entries (if provided)
      if (Array.isArray(applicableHolidayIds) && applicableHolidayIds.length > 0) {
        for (const manageHolidayID of applicableHolidayIds) {
          // Reuse existing PublicHoliday for same org + manageHoliday if present
          let pub = await prisma.publicHoliday.findFirst({
            where: {
              manageHolidayID,
              serviceProviderID: policy.serviceProviderID ?? null,
              companyID: policy.companyID ?? null,
              branchesID: policy.branchesID ?? null,
            },
          });
          if (!pub) {
            pub = await prisma.publicHoliday.create({
              data: {
                serviceProviderID: policy.serviceProviderID ?? null,
                companyID: policy.companyID ?? null,
                branchesID: policy.branchesID ?? null,
                manageHolidayID,
              },
            });
          }
          await prisma.leavePolicyHoliday.create({
            data: {
              leavePolicyID: policy.id,
              publicHolidayID: pub.id,
              serviceProviderID: policy.serviceProviderID ?? null,
              companyID: policy.companyID ?? null,
              branchesID: policy.branchesID ?? null,
            },
          });
        }
      }

      return policy;
    });
  }

  async findAll() {
    return this.prisma.leavePolicy.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        leavePolicyHoliday: {
          include: {
            publicHoliday: {
              include: {
                manageHoliday: true,
              },
            },
          },
        },
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
        leavePolicyHoliday: {
          include: {
            publicHoliday: {
              include: { manageHoliday: true },
            },
          },
        },
      },
    });

    if (!leavePolicy) {
      throw new NotFoundException(`Leave policy with ID ${id} not found`);
    }

    return leavePolicy;
  }

  async update(id: number, updateLeavePolicyDto: UpdateLeavePolicyDto) {
    const { applicableHolidayIds, ...rest } = updateLeavePolicyDto as any;
    await this.findOne(id);

    return this.prisma.$transaction(async (prisma) => {
      const policy = await prisma.leavePolicy.update({
        where: { id },
        data: rest,
        include: {
          serviceProvider: true,
          company: true,
          branches: true,
        },
      });

      if (Array.isArray(applicableHolidayIds)) {
        // Clear existing links
        await prisma.leavePolicyHoliday.deleteMany({ where: { leavePolicyID: id } });

        // Re-add links
        for (const manageHolidayID of applicableHolidayIds) {
          let pub = await prisma.publicHoliday.findFirst({
            where: {
              manageHolidayID,
              serviceProviderID: policy.serviceProviderID ?? null,
              companyID: policy.companyID ?? null,
              branchesID: policy.branchesID ?? null,
            },
          });
          if (!pub) {
            pub = await prisma.publicHoliday.create({
              data: {
                serviceProviderID: policy.serviceProviderID ?? null,
                companyID: policy.companyID ?? null,
                branchesID: policy.branchesID ?? null,
                manageHolidayID,
              },
            });
          }
          await prisma.leavePolicyHoliday.create({
            data: {
              leavePolicyID: policy.id,
              publicHolidayID: pub.id,
              serviceProviderID: policy.serviceProviderID ?? null,
              companyID: policy.companyID ?? null,
              branchesID: policy.branchesID ?? null,
            },
          });
        }
      }

      return policy;
    });
  }

  async remove(id: number) {
    const leavePolicy = await this.findOne(id);
    
    return this.prisma.$transaction(async (prisma) => {
      // First delete all related leavePolicyHoliday records
      await prisma.leavePolicyHoliday.deleteMany({
        where: { leavePolicyID: id },
      });
      
      // Then delete all related EmpPromotion records that reference this leave policy
      await prisma.empPromotion.updateMany({
        where: { leavePolicyID: id },
        data: { leavePolicyID: null }, // Set to null instead of deleting the promotion
      });
      
      // Finally delete the leave policy record
      return prisma.leavePolicy.delete({
        where: { id },
      });
    });
  }
}
