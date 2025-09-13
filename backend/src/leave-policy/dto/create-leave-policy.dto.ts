import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';

export class CreateLeavePolicyDto {
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
  @IsString()
  leavePolicyName?: string;

  @IsOptional()
  @IsString()
  sickLeaveCount?: string;

  @IsOptional()
  @IsString()
  casualLeaveCount?: string;

  @IsOptional()
  @IsString()
  earnLeaveWorkingMonths?: string;

  @IsOptional()
  @IsInt()
  earnLeaveCount?: number;
}
