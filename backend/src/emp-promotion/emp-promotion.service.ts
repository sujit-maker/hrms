import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmpPromotionDto } from "./dto/create-emp-promotion.dto";
import { UpdateEmpPromotionDto } from "./dto/update-emp-promotion.dto";

@Injectable()
export class EmpPromotionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEmpPromotionDto) {
    return this.prisma.empPromotion.create({
      data: {
        manageEmployeeID: dto.manageEmployeeID,
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
      },
      include: this._includeAll(),
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
    return this.prisma.empPromotion.update({
      where: { id },
      data: {
        manageEmployeeID: dto.manageEmployeeID,
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
      },
      include: this._includeAll(),
    });
  }

  remove(id: number) {
    return this.prisma.empPromotion.delete({ where: { id } });
  }

  private _includeAll() {
    return {
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
