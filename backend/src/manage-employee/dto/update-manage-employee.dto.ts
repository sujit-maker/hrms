import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EduUpdateDto {
  @IsOptional() @IsInt() id?: number; // present if updating
  @IsOptional() @IsString() instituteType?: string;
  @IsOptional() @IsString() instituteName?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() pasingYear?: string;
  @IsOptional() @IsString() marks?: string;
  @IsOptional() @IsString() gpaCgpa?: string;
  @IsOptional() @IsString() class?: string;
}

export class ExpUpdateDto {
  @IsOptional() @IsInt() id?: number;
  @IsOptional() @IsString() orgName?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsString() toDate?: string;
  @IsOptional() @IsString() responsibility?: string;
  @IsOptional() @IsString() skill?: string;
}

export class DevMapUpdateDto {
  @IsOptional() @IsInt() id?: number;   // present if updating
  @IsInt() deviceID!: number;           // always required to connect/keep
  @IsOptional() @IsString() deviceEmpCode?: string;
}

export class PromotionUpdateDto {
  @IsOptional() @IsInt() id?: number;
  @IsOptional() @IsInt() departmentNameID?: number | null;
  @IsOptional() @IsInt() designationID?: number | null;
  @IsOptional() @IsInt() managerID?: number | null;
  @IsOptional() @IsString() employmentType?: string | null;
  @IsOptional() @IsString() employmentStatus?: string | null;
  @IsOptional() @IsString() probationPeriod?: string | null;
  @IsOptional() @IsInt() workShiftID?: number | null;
  @IsOptional() @IsInt() attendancePolicyID?: number | null;
  @IsOptional() @IsInt() leavePolicyID?: number | null;
  @IsOptional() @IsString() salaryPayGradeType?: string | null;
  @IsOptional() @IsInt() monthlyPayGradeID?: number | null;
  @IsOptional() @IsInt() hourlyPayGradeID?: number | null;
}

export class UpdateManageEmployeeDto {
  // FKs
  @IsOptional() @IsInt() serviceProviderID?: number | null;
  @IsOptional() @IsInt() companyID?: number | null;
  @IsOptional() @IsInt() branchesID?: number | null;
  @IsOptional() @IsInt() contractorID?: number | null;

  // Scalars
  @IsOptional() @IsString() employeeFirstName?: string | null;
  @IsOptional() @IsString() employeeLastName?: string | null;
  @IsOptional() @IsString() deviceEmployeeCode?: string | null;
  @IsOptional() @IsString() employeeID?: string | null;

  @IsOptional() @IsString() joiningDate?: string | null;
  @IsOptional() @IsString() businessPhoneNo?: string | null;
  @IsOptional() @IsEmail() businessEmail?: string | null;
  @IsOptional() @IsString() personalPhoneNo?: string | null;
  @IsOptional() @IsEmail() personalEmail?: string | null;
  @IsOptional() @IsString() emergancyContact?: string | null;

  @IsOptional() @IsString() presentAddress?: string | null;
  @IsOptional() @IsString() permenantAddress?: string | null;

  @IsOptional() @IsString() employeePhotoUrl?: string | null;
  @IsOptional() @IsString() gender?: string | null;
  @IsOptional() @IsString() dateOfBirth?: string | null; // fixed typo
  @IsOptional() @IsString() bloodGroup?: string | null;
  @IsOptional() @IsString() maritalStatus?: string | null;
  @IsOptional() @IsString() employeeFatherName?: string | null;
  @IsOptional() @IsString() employeeMotherName?: string | null;
  @IsOptional() @IsString() employeeSpouseName?: string | null;

  // Basic position fields (stored directly on ManageEmployee)
  @IsOptional() @IsInt() departmentNameID?: number | null;
  @IsOptional() @IsInt() designationID?: number | null;
  @IsOptional() @IsInt() managerID?: number | null;
  @IsOptional() @IsString() employmentType?: string | null;
  @IsOptional() @IsString() employmentStatus?: string | null;
  @IsOptional() @IsString() probationPeriod?: string | null;
  @IsOptional() @IsInt() workShiftID?: number | null;
  @IsOptional() @IsInt() attendancePolicyID?: number | null;
  @IsOptional() @IsInt() leavePolicyID?: number | null;
  @IsOptional() @IsString() salaryPayGradeType?: string | null;
  @IsOptional() @IsInt() monthlyPayGradeID?: number | null;
  @IsOptional() @IsInt() hourlyPayGradeID?: number | null;

  // Nested arrays (upsert)
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EduUpdateDto)
  edu?: EduUpdateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpUpdateDto)
  exp?: ExpUpdateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevMapUpdateDto)
  devices?: DevMapUpdateDto[];

  // Promotion (1:1)
  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionUpdateDto)
  promotion?: PromotionUpdateDto;

  // Optional arrays of ids to delete
  @IsOptional() @IsArray() eduIdsToDelete?: number[];
  @IsOptional() @IsArray() expIdsToDelete?: number[];
  @IsOptional() @IsArray() deviceMapIdsToDelete?: number[];
}
