import { IsOptional, IsString, IsInt, IsDateString } from 'class-validator';

export class CreateEmpAttendanceRegulariseDto {
  @IsOptional()
  @IsInt()
  serviceProviderID?: number;

  @IsOptional()
  @IsInt()
  companyID?: number;

  @IsOptional()
  @IsInt()
  branchesID?: number;

  @IsOptional()
  @IsInt()
  manageEmployeeID?: number;

  @IsOptional()
  @IsDateString()
  attendanceDate?: string;

  @IsOptional()
  @IsString()
  day?:string;

  @IsOptional()
  @IsDateString()
  checkInTime?: string;

  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
