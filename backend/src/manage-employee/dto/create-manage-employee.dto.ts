import { Type } from "class-transformer";
import { 
  IsOptional, 
  IsInt, 
  IsString, 
  IsEmail, 
  IsArray, 
  ValidateNested, 
  Matches, 
  Length, 
  IsBoolean 
} from "class-validator";

// ---------- Promotion DTO ----------
export class PromotionCreateDto {
  @IsOptional() @IsInt() departmentNameID?: number;
  @IsOptional() @IsInt() designationID?: number;
  @IsOptional() @IsInt() managerID?: number;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsString() probationPeriod?: string;
  @IsOptional() @IsInt() workShiftID?: number;
  @IsOptional() @IsInt() attendancePolicyID?: number;
  @IsOptional() @IsInt() leavePolicyID?: number;
  @IsOptional() @IsString() salaryPayGradeType?: string;
  @IsOptional() @IsInt() monthlyPayGradeID?: number;
  @IsOptional() @IsInt() hourlyPayGradeID?: number;
}

// ---------- Bank Details DTO ----------
export class BankDetailsCreateDto {
  @IsOptional() @IsInt() id?: number;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() bankBranchName?: string;
  @IsOptional() @IsString() accNumber?: string;
  @IsOptional() @IsString() ifscCode?: string;
  @IsOptional() @IsString() upi?: string;
}

// ---------- Education DTO ----------
export class EduCreateDto {
  @IsOptional() @IsString() instituteType?: string;
  @IsOptional() @IsString() instituteName?: string;
  @IsOptional() @IsString() degree?: string;
  @IsOptional() @IsString() pasingYear?: string;
  @IsOptional() @IsString() marks?: string;
  @IsOptional() @IsString() gpaCgpa?: string;
  @IsOptional() @IsString() class?: string;
}

// ---------- Experience DTO ----------
export class ExpCreateDto {
  @IsOptional() @IsString() orgName?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsString() toDate?: string;
  @IsOptional() @IsString() responsibility?: string;
  @IsOptional() @IsString() skill?: string;
}

// ---------- Device Mapping DTO ----------
export class DevMapCreateDto {
  @IsInt() deviceID!: number;
  @IsOptional() @IsString() deviceEmpCode?: string;
}

// ---------- Employee Credentials DTO ----------
export class EmployeeCredentialsCreateDto {
  @IsOptional() @IsString() 
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Username can only contain letters, numbers, underscores, and hyphens' 
  })
  username?: string;

  @IsOptional() @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { 
    message: 'Password must be a valid phone number' 
  })
  password?: string;

  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class EmployeeCredentialsUpdateDto {
  @IsOptional() @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Username can only contain letters, numbers, underscores, and hyphens' 
  })
  username?: string;

  @IsOptional() @IsString()
  @Length(6, 100, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional() @IsBoolean() 
  isActive?: boolean;
}

// ---------- Login DTO ----------
export class EmployeeLoginDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Username can only contain letters, numbers, underscores, and hyphens' 
  })
  username!: string;

  @IsString()
  @Length(1, 100, { message: 'Password is required' })
  password!: string;
}

// ---------- Create Employee DTO ----------
export class CreateManageEmployeeDto {
  // FKs
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;
  @IsOptional() @IsInt() contractorID?: number;

  // Scalars
  @IsOptional() @IsString() employeeFirstName?: string;
  @IsOptional() @IsString() employeeLastName?: string;
  
  // Add validation for employeeID since it's used as username
  @IsOptional() 
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Employee ID can only contain letters, numbers, underscores, and hyphens' 
  })
  employeeID?: string;
  
  @IsOptional() @IsString() joiningDate?: string;

  @IsOptional() @IsString() businessPhoneNo?: string;
  @IsOptional() @IsEmail() businessEmail?: string;
  
  // Add phone validation for personalPhoneNo since it's used as password
  @IsOptional() 
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { 
    message: 'Personal phone number must be a valid phone number' 
  })
  personalPhoneNo?: string;
  
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

  // Basic position fields (stored directly on ManageEmployee)
  @IsOptional() @IsInt() departmentNameID?: number;
  @IsOptional() @IsInt() designationID?: number;
  @IsOptional() @IsInt() managerID?: number;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsString() probationPeriod?: string;
  @IsOptional() @IsInt() workShiftID?: number;
  @IsOptional() @IsInt() attendancePolicyID?: number;
  @IsOptional() @IsInt() leavePolicyID?: number;
  @IsOptional() @IsString() salaryPayGradeType?: string;
  @IsOptional() @IsInt() monthlyPayGradeID?: number;
  @IsOptional() @IsInt() hourlyPayGradeID?: number;

  // Nested arrays
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EduCreateDto)
  edu?: EduCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsCreateDto)
  bankDetails?: BankDetailsCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpCreateDto)
  exp?: ExpCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevMapCreateDto)
  devices?: DevMapCreateDto[];

  // Promotion (1:1 relation)
  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionCreateDto)
  promotion?: PromotionCreateDto;
}

// ---------- Update Employee DTO ----------
export class UpdateManageEmployeeDto {
  // FKs
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;
  @IsOptional() @IsInt() contractorID?: number;

  // Scalars
  @IsOptional() @IsString() employeeFirstName?: string;
  @IsOptional() @IsString() employeeLastName?: string;
  
  @IsOptional() 
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Employee ID can only contain letters, numbers, underscores, and hyphens' 
  })
  employeeID?: string;
  
  @IsOptional() @IsString() joiningDate?: string;

  @IsOptional() @IsString() businessPhoneNo?: string;
  @IsOptional() @IsEmail() businessEmail?: string;
  
  @IsOptional() 
  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { 
    message: 'Personal phone number must be a valid phone number' 
  })
  personalPhoneNo?: string;
  
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

  // Basic position fields (stored directly on ManageEmployee)
  @IsOptional() @IsInt() departmentNameID?: number;
  @IsOptional() @IsInt() designationID?: number;
  @IsOptional() @IsInt() managerID?: number;
  @IsOptional() @IsString() employmentType?: string;
  @IsOptional() @IsString() employmentStatus?: string;
  @IsOptional() @IsString() probationPeriod?: string;
  @IsOptional() @IsInt() workShiftID?: number;
  @IsOptional() @IsInt() attendancePolicyID?: number;
  @IsOptional() @IsInt() leavePolicyID?: number;
  @IsOptional() @IsString() salaryPayGradeType?: string;
  @IsOptional() @IsInt() monthlyPayGradeID?: number;
  @IsOptional() @IsInt() hourlyPayGradeID?: number;

  // Nested arrays
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EduCreateDto)
  edu?: EduCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankDetailsCreateDto)
  bankDetails?: BankDetailsCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpCreateDto)
  exp?: ExpCreateDto[];

  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevMapCreateDto)
  devices?: DevMapCreateDto[];

  // Promotion (1:1 relation)
  @IsOptional()
  @ValidateNested()
  @Type(() => PromotionCreateDto)
  promotion?: PromotionCreateDto;

  // For deletion tracking
  @IsOptional() @IsArray() @IsInt({ each: true }) eduIdsToDelete?: number[];
  @IsOptional() @IsArray() @IsInt({ each: true }) expIdsToDelete?: number[];
  @IsOptional() @IsArray() @IsInt({ each: true }) deviceMapIdsToDelete?: number[];
  @IsOptional() @IsArray() @IsInt({ each: true }) bankDetailsIdsToDelete?: number[];
}