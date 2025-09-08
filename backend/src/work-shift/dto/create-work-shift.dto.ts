import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateWorkShiftDto {
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;

  @IsOptional() @IsString() workShiftName?: string;
  @IsOptional() @IsString() isActive?: string;
}
