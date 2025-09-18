import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManageEmployeeDto } from './dto/create-manage-employee.dto';
import { UpdateManageEmployeeDto } from './dto/update-manage-employee.dto';

@Injectable()
export class ManageEmployeeService {
  constructor(private prisma: PrismaService) {}

  // CREATE employee with nested rows
  create(dto: CreateManageEmployeeDto) {
  const {
    serviceProviderID,
    companyID,
    branchesID,
    contractorID,
    // Extract basic position fields
    departmentNameID,
    designationID,
    managerID,
    employmentType,
    employmentStatus,
    probationPeriod,
    workShiftID,
    attendancePolicyID,
    leavePolicyID,
    salaryPayGradeType,
    monthlyPayGradeID,
    hourlyPayGradeID,
    edu = [],
    exp = [],
    devices = [],
    promotion,
    ...scalars
  } = dto;

  return this.prisma.manageEmployee.create({
    data: {
      ...scalars,

      // Basic position scalars
      ...(employmentType !== undefined ? { employmentType } : {}),
      ...(employmentStatus !== undefined ? { employmentStatus } : {}),
      ...(probationPeriod !== undefined ? { probationPeriod } : {}),
      ...(salaryPayGradeType !== undefined ? { salaryPayGradeType } : {}),

      // Basic position fields (direct field assignments)
      ...(departmentNameID != null ? { departmentNameID } : {}),
      ...(designationID != null ? { designationID } : {}),
      ...(managerID != null ? { managerID } : {}),
      ...(workShiftID != null ? { workShiftID } : {}),
      ...(attendancePolicyID != null ? { attendancePolicyID } : {}),
      ...(leavePolicyID != null ? { leavePolicyID } : {}),
      ...(monthlyPayGradeID != null ? { monthlyPayGradeID } : {}),
      ...(hourlyPayGradeID != null ? { hourlyPayGradeID } : {}),

      // Foreign key fields (use direct assignment instead of relations)
      serviceProviderID: serviceProviderID ?? undefined,
      companyID: companyID ?? undefined,
      branchesID: branchesID ?? undefined,
      contractorID: contractorID ?? undefined,

      // nested creates
      empEduQualification: {
        create: edu.map((e) => ({
          instituteType: e.instituteType ?? null,
          instituteName: e.instituteName ?? null,
          degree: e.degree ?? null,
          pasingYear: e.pasingYear ?? null,
          marks: e.marks ?? null,
          gpaCgpa: e.gpaCgpa ?? null,
          class: e.class ?? null,
        })),
      },
      empProfExprience: {
        create: exp.map((x) => ({
          orgName: x.orgName ?? null,
          designation: x.designation ?? null,
          fromDate: x.fromDate ?? null,
          toDate: x.toDate ?? null,
          responsibility: x.responsibility ?? null,
          skill: x.skill ?? null,
        })),
      },
      empDeviceMapping: {
        create: devices.map((d) => ({
          deviceID: d.deviceID,
          deviceEmpCode: d.deviceEmpCode ?? null,
        })),
      },
      // Do not auto-create empPromotion from ManageEmployee create
      // Promotion records should only be created explicitly via Employee Promotions form
    } as any,
    include: {
      serviceProvider: true,
      company: true,
      branches: true,
      contractors: true,
      empEduQualification: true,
      empProfExprience: true,
      empDeviceMapping: { include: { device: true } },
      empPromotion: { 
        orderBy: { id: 'desc' },
        include: {
          departments: true,
          designations: true,
          workShift: true,
          attendancePolicy: true,
          leavePolicy: true,
          hourlyPayGrade: true,
          monthlyPayGrade: true,
        }
      },
    },
  });
}


  findAll() {
    return this.prisma.manageEmployee.findMany({
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        contractors: true,
        // Basic position relations
        departments: true,
        designations: true,
        manager: true,
        workShift: true,
        attendancePolicy: true,
        leavePolicy: true,
        monthlyPayGrade: true,
        hourlyPayGrade: true,
        empEduQualification: true,
        empProfExprience: true,
        empDeviceMapping: { include: { device: true } },
        empPromotion: { 
          orderBy: { id: 'desc' },
          include: {
            departments: true,
            designations: true,
            workShift: true,
            attendancePolicy: true,
            leavePolicy: true,
            hourlyPayGrade: true,
            monthlyPayGrade: true,
          }
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.manageEmployee.findUnique({
      where: { id },
    include: {
      serviceProvider: true,
      company: true,
      branches: true,
      contractors: true,
      // Basic position relations
      departments: true,
      designations: true,
      manager: true,
      workShift: true,
      attendancePolicy: true,
      leavePolicy: true,
      monthlyPayGrade: true,
      hourlyPayGrade: true,
      empEduQualification: true,
      empProfExprience: true,
      empDeviceMapping: { include: { device: true } },
      empPromotion: { 
        orderBy: { id: 'desc' },
        include: {
          departments: true,
          designations: true,
          workShift: true,
          attendancePolicy: true,
          leavePolicy: true,
          hourlyPayGrade: true,
          monthlyPayGrade: true,
        }
      },
    },
    });
  }

  async update(id: number, dto: UpdateManageEmployeeDto) {
  const {
    serviceProviderID,
    companyID,
    branchesID,
    contractorID,
    // Extract basic position fields
    departmentNameID,
    designationID,
    managerID,
    employmentType,
    employmentStatus,
    probationPeriod,
    workShiftID,
    attendancePolicyID,
    leavePolicyID,
    salaryPayGradeType,
    monthlyPayGradeID,
    hourlyPayGradeID,
    edu,
    exp,
    devices,
    promotion,
    eduIdsToDelete = [],
    expIdsToDelete = [],
    deviceMapIdsToDelete = [],
    ...scalars
  } = dto;

  return this.prisma.$transaction(async (tx) => {
    // 1) update parent scalars + relations
    await tx.manageEmployee.update({
      where: { id },
      data: {
        ...scalars,
        
        // Basic position scalars
        ...(employmentType !== undefined ? { employmentType } : {}),
        ...(employmentStatus !== undefined ? { employmentStatus } : {}),
        ...(probationPeriod !== undefined ? { probationPeriod } : {}),
        ...(salaryPayGradeType !== undefined ? { salaryPayGradeType } : {}),
        
        // Basic position fields (direct field assignments)
        ...(departmentNameID !== undefined ? { departmentNameID } : {}),
        ...(designationID !== undefined ? { designationID } : {}),
        ...(managerID !== undefined ? { managerID } : {}),
        ...(workShiftID !== undefined ? { workShiftID } : {}),
        ...(attendancePolicyID !== undefined ? { attendancePolicyID } : {}),
        ...(leavePolicyID !== undefined ? { leavePolicyID } : {}),
        ...(monthlyPayGradeID !== undefined ? { monthlyPayGradeID } : {}),
        ...(hourlyPayGradeID !== undefined ? { hourlyPayGradeID } : {}),
        
        // Foreign key fields (use direct assignment instead of relations)
        serviceProviderID: serviceProviderID ?? undefined,
        companyID: companyID ?? undefined,
        branchesID: branchesID ?? undefined,
        contractorID: contractorID ?? undefined,
      } as any,
    });

    // 2) delete removed children
    if (eduIdsToDelete.length) {
      await tx.empEduQualification.deleteMany({
        where: { id: { in: eduIdsToDelete }, manageEmployeeID: id },
      });
    }
    if (expIdsToDelete.length) {
      await tx.empProfExprience.deleteMany({
        where: { id: { in: expIdsToDelete }, manageEmployeeID: id },
      });
    }
    if (deviceMapIdsToDelete.length) {
      await tx.empDeviceMapping.deleteMany({
        where: { id: { in: deviceMapIdsToDelete }, manageEmployeeID: id },
      });
    }

    // 3) upsert edu
    if (edu?.length) {
      const toUpdate = edu.filter((e) => !!e.id);
      const toCreate = edu.filter((e) => !e.id);
      for (const e of toUpdate) {
        await tx.empEduQualification.update({
          where: { id: e.id! },
          data: {
            instituteType: e.instituteType ?? null,
            instituteName: e.instituteName ?? null,
            degree: e.degree ?? null,
            pasingYear: e.pasingYear ?? null,
            marks: e.marks ?? null,
            gpaCgpa: e.gpaCgpa ?? null,
            class: e.class ?? null,
          },
        });
      }
      if (toCreate.length) {
        await tx.empEduQualification.createMany({
          data: toCreate.map((e) => ({
            manageEmployeeID: id,
            instituteType: e.instituteType ?? null,
            instituteName: e.instituteName ?? null,
            degree: e.degree ?? null,
            pasingYear: e.pasingYear ?? null,
            marks: e.marks ?? null,
            gpaCgpa: e.gpaCgpa ?? null,
            class: e.class ?? null,
          })),
        });
      }
    }

    // 4) upsert exp
    if (exp?.length) {
      const toUpdate = exp.filter((x) => !!x.id);
      const toCreate = exp.filter((x) => !x.id);
      for (const x of toUpdate) {
        await tx.empProfExprience.update({
          where: { id: x.id! },
          data: {
            orgName: x.orgName ?? null,
            designation: x.designation ?? null,
            fromDate: x.fromDate ?? null,
            toDate: x.toDate ?? null,
            responsibility: x.responsibility ?? null,
            skill: x.skill ?? null,
          },
        });
      }
      if (toCreate.length) {
        await tx.empProfExprience.createMany({
          data: toCreate.map((x) => ({
            manageEmployeeID: id,
            orgName: x.orgName ?? null,
            designation: x.designation ?? null,
            fromDate: x.fromDate ?? null,
            toDate: x.toDate ?? null,
            responsibility: x.responsibility ?? null,
            skill: x.skill ?? null,
          })),
        });
      }
    }

    // 5) upsert devices
    if (devices?.length) {
      const toUpdate = devices.filter((d) => !!d.id);
      const toCreate = devices.filter((d) => !d.id);
      for (const d of toUpdate) {
        await tx.empDeviceMapping.update({
          where: { id: d.id! },
          data: {
            device: { connect: { id: d.deviceID } },
            deviceEmpCode: d.deviceEmpCode ?? null,
          },
        });
      }
      for (const d of toCreate) {
        await tx.empDeviceMapping.create({
          data: {
            manageEmployee: { connect: { id } },
            device: { connect: { id: d.deviceID } },
            deviceEmpCode: d.deviceEmpCode ?? null,
          },
        });
      }
    }

    // 6) upsert promotion
    if (promotion) {
      if (promotion.id) {
        await tx.empPromotion.update({
          where: { id: promotion.id },
          data: {
            departmentNameID: promotion.departmentNameID ?? null,
            designationID: promotion.designationID ?? null,
            managerID: promotion.managerID ?? null,
            employmentType: promotion.employmentType ?? null,
            employmentStatus: promotion.employmentStatus ?? null,
            probationPeriod: promotion.probationPeriod ?? null,
            workShiftID: promotion.workShiftID ?? null,
            attendancePolicyID: promotion.attendancePolicyID ?? null,
            leavePolicyID: promotion.leavePolicyID ?? null,
            salaryPayGradeType: promotion.salaryPayGradeType ?? null,
            monthlyPayGradeID: promotion.monthlyPayGradeID ?? null,
            hourlyPayGradeID: promotion.hourlyPayGradeID ?? null,
          },
        });
      } else {
        await tx.empPromotion.create({
          data: {
            manageEmployeeID: id,
            departmentNameID: promotion.departmentNameID ?? null,
            designationID: promotion.designationID ?? null,
            managerID: promotion.managerID ?? null,
            employmentType: promotion.employmentType ?? null,
            employmentStatus: promotion.employmentStatus ?? null,
            probationPeriod: promotion.probationPeriod ?? null,
            workShiftID: promotion.workShiftID ?? null,
            attendancePolicyID: promotion.attendancePolicyID ?? null,
            leavePolicyID: promotion.leavePolicyID ?? null,
            salaryPayGradeType: promotion.salaryPayGradeType ?? null,
            monthlyPayGradeID: promotion.monthlyPayGradeID ?? null,
            hourlyPayGradeID: promotion.hourlyPayGradeID ?? null,
          },
        });
      }
    }

    // 7) return fresh
    return tx.manageEmployee.findUnique({
      where: { id },
      include: {
        serviceProvider: true,
        company: true,
        branches: true,
        contractors: true,
        // Basic position relations
        departments: true,
        designations: true,
        manager: true,
        workShift: true,
        attendancePolicy: true,
        leavePolicy: true,
        monthlyPayGrade: true,
        hourlyPayGrade: true,
        empEduQualification: true,
        empProfExprience: true,
        empDeviceMapping: { include: { device: true } },
        empPromotion: { 
          orderBy: { id: 'desc' },
          include: {
            departments: true,
            designations: true,
            workShift: true,
            attendancePolicy: true,
            leavePolicy: true,
            hourlyPayGrade: true,
            monthlyPayGrade: true,
          }
        },
      },
    });
  });
}

 async remove(id: number) {
  try {
    await this.prisma.$transaction([
      // Delete children that FK to manageEmployeeID
      this.prisma.empDeviceMapping.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.empProfExprience.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.empEduQualification.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.empCurrentPosition.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.promotionRequest.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.empPromotion.deleteMany({ where: { manageEmployeeID: id } }),
      
      // ADDED: Missing tables that reference ManageEmployee
      this.prisma.empAttendanceRegularise.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.empFieldSiteAttendance.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.genarateBonus.deleteMany({ where: { manageEmployeeID: id } }),
      this.prisma.leaveApplication.deleteMany({ where: { manageEmployeeID: id } }),
      
      // ADDED: BonusAllocation uses employeeID field to reference ManageEmployee
      this.prisma.bonusAllocation.deleteMany({ where: { employeeID: id } }),

      // Finally delete the ManageEmployee record
      this.prisma.manageEmployee.delete({ where: { id } }),
    ]);
    return { success: true };
  } catch (e: any) {
    if (e?.code === 'P2003') {
      // FK still exists somewhere you didn't clean up
      throw new Error(
        'Cannot delete employee: related records exist (education/experience/mappings/etc).'
      );
    }
    throw e;
  }
}

}
