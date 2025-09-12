import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateEmpPromotionDto {
  @IsInt() manageEmployeeID!: number;

  @IsOptional() @IsInt() departmentNameID?: number | null;
  @IsOptional() @IsInt() designationID?: number | null;
  @IsOptional() @IsInt() managerID?: number | null;

  @IsOptional() @IsString() employmentType?: string | null;      // "Company" | "Contract"
  @IsOptional() @IsString() employmentStatus?: string | null;    // "Permanent" | "Probation"
  @IsOptional() @IsString() probationPeriod?: string | null;     // e.g. "6 months"

  @IsOptional() @IsInt() workShiftID?: number | null;
  @IsOptional() @IsInt() attendancePolicyID?: number | null;
  @IsOptional() @IsInt() leavePolicyID?: number | null;

  @IsOptional() @IsString() salaryPayGradeType?: string | null;  // "Monthly" | "Hourly"
  @IsOptional() @IsInt() monthlyPayGradeID?: number | null;
  @IsOptional() @IsInt() hourlyPayGradeID?: number | null;
}
