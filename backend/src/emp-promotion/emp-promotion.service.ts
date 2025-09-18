import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmpPromotionDto } from "./dto/create-emp-promotion.dto";
import { UpdateEmpPromotionDto } from "./dto/update-emp-promotion.dto";

@Injectable()
export class EmpPromotionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEmpPromotionDto) {
    // Create promotion and sync latest values back to ManageEmployee
    return this.prisma.$transaction(async (tx) => {
      // 0) If this is the first promotion for the employee, snapshot the current ManageEmployee state
      const existingCount = await tx.empPromotion.count({ where: { manageEmployeeID: dto.manageEmployeeID } });
      if (existingCount === 0) {
        const base = await tx.manageEmployee.findUnique({ where: { id: dto.manageEmployeeID }, include: {
          departments: true,
          designations: true,
          workShift: true,
          attendancePolicy: true,
          leavePolicy: true,
          monthlyPayGrade: true,
          hourlyPayGrade: true,
        }});
        if (base) {
          await tx.empPromotion.create({
            data: {
              manageEmployeeID: base.id,
              serviceProviderID: base.serviceProviderID ?? null,
              companyID: base.companyID ?? null,
              branchesID: base.branchesID ?? null,
              departmentNameID: base.departmentNameID ?? null,
              designationID: base.designationID ?? null,
              managerID: base.managerID ?? null,
              employmentType: (base as any).employmentType ?? null,
              employmentStatus: (base as any).employmentStatus ?? null,
              probationPeriod: (base as any).probationPeriod ?? null,
              workShiftID: base.workShiftID ?? null,
              attendancePolicyID: base.attendancePolicyID ?? null,
              leavePolicyID: base.leavePolicyID ?? null,
              salaryPayGradeType: (base as any).salaryPayGradeType ?? null,
              monthlyPayGradeID: base.monthlyPayGradeID ?? null,
              hourlyPayGradeID: base.hourlyPayGradeID ?? null,
              promotionDate: (base as any).joiningDate ? new Date((base as any).joiningDate) : null,
            } as any,
          });
        }
      }

      const created = await tx.empPromotion.create({
        data: {
          manageEmployeeID: dto.manageEmployeeID,
          serviceProviderID: dto.serviceProviderID ?? null,
          companyID: dto.companyID ?? null,
          branchesID: dto.branchesID ?? null,
          departmentNameID: dto.departmentNameID ?? null,
          designationID: dto.designationID ?? null,
          managerID: dto.managerID ?? null,
          employmentType: dto.employmentType ?? null,
          employmentStatus: dto.employmentStatus ?? null,
          probationPeriod: dto.probationPeriod ?? null,
          workShiftID: dto.workShiftID ?? null,
          attendancePolicyID: dto.attendancePolicyID ?? null,
          leavePolicyID: dto.leavePolicyID ?? null,
          salaryPayGradeType: dto.salaryPayGradeType ?? null,
          monthlyPayGradeID: dto.monthlyPayGradeID ?? null,
          hourlyPayGradeID: dto.hourlyPayGradeID ?? null,
          promotedSalaryCtc: dto.promotedSalaryCtc ?? null,
          description: dto.description ?? null,
          promotionDate: dto.promotionDate ? new Date(dto.promotionDate) : null,
          status: dto.status ?? null,
        } as any,
        include: this._includeAll(),
      });

      // Mirror the latest values on ManageEmployee so the Manage Employees table shows current state
      await tx.manageEmployee.update({
        where: { id: dto.manageEmployeeID },
        data: {
          ...(dto.serviceProviderID !== undefined ? { serviceProviderID: dto.serviceProviderID } : {}),
          ...(dto.companyID !== undefined ? { companyID: dto.companyID } : {}),
          ...(dto.branchesID !== undefined ? { branchesID: dto.branchesID } : {}),
          ...(dto.departmentNameID !== undefined ? { departmentNameID: dto.departmentNameID } : {}),
          ...(dto.designationID !== undefined ? { designationID: dto.designationID } : {}),
          ...(dto.managerID !== undefined ? { managerID: dto.managerID } : {}),
          ...(dto.employmentType !== undefined ? { employmentType: dto.employmentType as any } : {}),
          ...(dto.employmentStatus !== undefined ? { employmentStatus: dto.employmentStatus as any } : {}),
          ...(dto.probationPeriod !== undefined ? { probationPeriod: dto.probationPeriod as any } : {}),
          ...(dto.workShiftID !== undefined ? { workShiftID: dto.workShiftID } : {}),
          ...(dto.attendancePolicyID !== undefined ? { attendancePolicyID: dto.attendancePolicyID } : {}),
          ...(dto.leavePolicyID !== undefined ? { leavePolicyID: dto.leavePolicyID } : {}),
          ...(dto.salaryPayGradeType !== undefined ? { salaryPayGradeType: dto.salaryPayGradeType as any } : {}),
          ...(dto.monthlyPayGradeID !== undefined ? { monthlyPayGradeID: dto.monthlyPayGradeID } : {}),
          ...(dto.hourlyPayGradeID !== undefined ? { hourlyPayGradeID: dto.hourlyPayGradeID } : {}),
        } as any,
      });

      return created;
    });
  }

  findAll(manageEmployeeID?: number) {
    return this.prisma.empPromotion.findMany({
      where: manageEmployeeID ? { manageEmployeeID } : {},
      orderBy: { id: "desc" },
      include: this._includeAll(),
    });
  }

  findOne(id: number) {
    return this.prisma.empPromotion.findUnique({
      where: { id },
      include: this._includeAll(),
    });
  }

  update(id: number, dto: UpdateEmpPromotionDto) {
    // Update promotion and keep ManageEmployee in sync
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.empPromotion.update({
        where: { id },
        data: {
          ...(dto.manageEmployeeID !== undefined ? { manageEmployeeID: dto.manageEmployeeID } : {}),
          ...(dto.serviceProviderID !== undefined ? { serviceProviderID: dto.serviceProviderID } : {}),
          ...(dto.companyID !== undefined ? { companyID: dto.companyID } : {}),
          ...(dto.branchesID !== undefined ? { branchesID: dto.branchesID } : {}),
          ...(dto.departmentNameID !== undefined ? { departmentNameID: dto.departmentNameID } : {}),
          ...(dto.designationID !== undefined ? { designationID: dto.designationID } : {}),
          ...(dto.managerID !== undefined ? { managerID: dto.managerID } : {}),
          ...(dto.employmentType !== undefined ? { employmentType: dto.employmentType } : {}),
          ...(dto.employmentStatus !== undefined ? { employmentStatus: dto.employmentStatus } : {}),
          ...(dto.probationPeriod !== undefined ? { probationPeriod: dto.probationPeriod } : {}),
          ...(dto.workShiftID !== undefined ? { workShiftID: dto.workShiftID } : {}),
          ...(dto.attendancePolicyID !== undefined ? { attendancePolicyID: dto.attendancePolicyID } : {}),
          ...(dto.leavePolicyID !== undefined ? { leavePolicyID: dto.leavePolicyID } : {}),
          ...(dto.salaryPayGradeType !== undefined ? { salaryPayGradeType: dto.salaryPayGradeType } : {}),
          ...(dto.monthlyPayGradeID !== undefined ? { monthlyPayGradeID: dto.monthlyPayGradeID } : {}),
          ...(dto.hourlyPayGradeID !== undefined ? { hourlyPayGradeID: dto.hourlyPayGradeID } : {}),
          ...(dto.promotedSalaryCtc !== undefined ? { promotedSalaryCtc: dto.promotedSalaryCtc as any } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.promotionDate !== undefined ? { promotionDate: dto.promotionDate ? new Date(dto.promotionDate) : null } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
        },
        include: this._includeAll(),
      });

      // Determine which ManageEmployee to sync
      const empId = dto.manageEmployeeID ?? updated.manageEmployeeID;
      if (empId) {
        await tx.manageEmployee.update({
          where: { id: empId },
          data: {
            ...(dto.serviceProviderID !== undefined ? { serviceProviderID: dto.serviceProviderID } : {}),
            ...(dto.companyID !== undefined ? { companyID: dto.companyID } : {}),
            ...(dto.branchesID !== undefined ? { branchesID: dto.branchesID } : {}),
            ...(dto.departmentNameID !== undefined ? { departmentNameID: dto.departmentNameID } : {}),
            ...(dto.designationID !== undefined ? { designationID: dto.designationID } : {}),
            ...(dto.managerID !== undefined ? { managerID: dto.managerID } : {}),
            ...(dto.employmentType !== undefined ? { employmentType: dto.employmentType as any } : {}),
            ...(dto.employmentStatus !== undefined ? { employmentStatus: dto.employmentStatus as any } : {}),
            ...(dto.probationPeriod !== undefined ? { probationPeriod: dto.probationPeriod as any } : {}),
            ...(dto.workShiftID !== undefined ? { workShiftID: dto.workShiftID } : {}),
            ...(dto.attendancePolicyID !== undefined ? { attendancePolicyID: dto.attendancePolicyID } : {}),
            ...(dto.leavePolicyID !== undefined ? { leavePolicyID: dto.leavePolicyID } : {}),
            ...(dto.salaryPayGradeType !== undefined ? { salaryPayGradeType: dto.salaryPayGradeType as any } : {}),
            ...(dto.monthlyPayGradeID !== undefined ? { monthlyPayGradeID: dto.monthlyPayGradeID } : {}),
            ...(dto.hourlyPayGradeID !== undefined ? { hourlyPayGradeID: dto.hourlyPayGradeID } : {}),
          } as any,
        });
      }

      return updated;
    });
  }

  remove(id: number) {
    // Single click should remove the entry entirely from the table even if history exists.
    // Delete ALL promotion rows for the same employee as the selected row.
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.empPromotion.findUnique({ where: { id } });
      if (!target) return null as any;
      await tx.empPromotion.deleteMany({ where: { manageEmployeeID: target.manageEmployeeID } });
      return target; // return the originally requested row (response not used by UI)
    });
  }

  private _includeAll() {
    return {
      serviceProvider: true,
      company: true,
      branches: true,
      departments: true,
      designations: true,
      workShift: true,
      attendancePolicy: true,
      leavePolicy: true,
      hourlyPayGrade: true,
      monthlyPayGrade: true,
      manageEmployee: true,
    };
  }
}
