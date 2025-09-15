import { IsOptional, IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkShiftDayDto {
  @IsOptional() @IsString() weekDay?: string;
  @IsOptional() weeklyOff?: boolean;
  @IsOptional() startTime?: Date;
  @IsOptional() endTime?: Date;
  @IsOptional() @IsInt() totalMinutes?: number;
}

export class CreateWorkShiftDto {
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;
  @IsOptional() @IsString() workShiftName?: string;
  @IsOptional() @IsString() isActive?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => WorkShiftDayDto) workShiftDays?: WorkShiftDayDto[];
}