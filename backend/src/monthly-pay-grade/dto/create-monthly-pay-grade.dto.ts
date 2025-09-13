import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, ValidateNested, ArrayUnique, IsNumber } from 'class-validator';

export class CreateMonthlyPayGradeDto {
  @IsOptional() @Type(() => Number) @IsInt()
  serviceProviderID?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  companyID?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  branchesID?: number;

  @IsOptional() @IsString() @MaxLength(255)
  monthlyPayGradeName?: string;

  // Stored as String? in schema
  @IsOptional() @IsString() @MaxLength(100)
  grossSalary?: string;

  @IsOptional() @IsString() @MaxLength(100)
  percentageOfBasic?: string;

  // Int? in schema
  @IsOptional() @Type(() => Number) @IsInt()
  basicSalary?: number;

  // Junction lists
  @IsOptional() @IsArray() @ArrayUnique() @Type(() => Number)
  allowanceIDs?: number[];

  @IsOptional() @IsArray() @ArrayUnique() @Type(() => Number)
  deductionIDs?: number[];
}
