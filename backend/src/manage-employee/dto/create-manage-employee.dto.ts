import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EduCreateDto {
  @IsOptional() @IsString() instituteType?: string;
  @IsOptional() @IsString() instituteName?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() pasingYear?: string;
  @IsOptional() @IsString() marks?: string;
  @IsOptional() @IsString() gpaCgpa?: string;
  @IsOptional() @IsString() class?: string;
}

export class ExpCreateDto {
  @IsOptional() @IsString() orgName?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsString() toDate?: string;
  @IsOptional() @IsString() responsibility?: string;
  @IsOptional() @IsString() skill?: string;
}

export class DevMapCreateDto {
  @IsInt() deviceID!: number;                
  @IsOptional() @IsString() deviceEmpCode?: string;
}

export class CreateManageEmployeeDto {
  // FKs
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;

  @IsOptional() @IsInt() departmentNameID?: number;
  @IsOptional() @IsInt() designationID?: number;
  @IsOptional() @IsInt() managerID?: number;
  @IsOptional() @IsInt() contractorID?: number;
  @IsOptional() @IsInt() workShiftID?: number;
  @IsOptional() @IsInt() attendancePolicyID?: number;
  @IsOptional() @IsInt() leavePolicyID?: number;

  // Scalars
  @IsOptional() @IsString() employeeFirstName?: string;
  @IsOptional() @IsString() employeeLastName?: string;
  @IsOptional() @IsString() deviceEmployeeCode?: string;
  @IsOptional() @IsString() employeeID?: string;

  @IsOptional() @IsString() joiningDate?: string;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsString() probationPeriod?: string;
  @IsOptional() @IsString() salaryPayGradeType?: string;

  @IsOptional() @IsString() businessPhoneNo?: string;
  @IsOptional() @IsEmail() businessEmail?: string;
  @IsOptional() @IsString() personalPhoneNo?: string;
  @IsOptional() @IsEmail() personalEmail?: string;
  @IsOptional() @IsString() emergancyContact?: string;

  @IsOptional() @IsString() presentAddress?: string;
  @IsOptional() @IsString() permenantAddress?: string;

  @IsOptional() @IsString() employeePhotoUrl?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() dateOfBirth?: string;
  @IsOptional() @IsString() bloodGroup?: string;
  @IsOptional() @IsString() maritalStatus?: string;
  @IsOptional() @IsString() employeeFatherName?: string;
  @IsOptional() @IsString() employeeMotherName?: string;
  @IsOptional() @IsString() employeeSpouseName?: string;

  // Nested arrays
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EduCreateDto)
  edu?: EduCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpCreateDto)
  exp?: ExpCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevMapCreateDto)
  devices?: DevMapCreateDto[];
}
