import { IsInt, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class CreateReimbursementItemDto {
  @IsOptional() @IsString() reimbursementType?: string;
  @IsOptional() @IsString() amount?: string;
  @IsOptional() @IsString() description?: string;
}

export class CreateReimbursementDto {
  @IsOptional() @IsInt() serviceProviderID?: number;
  @IsOptional() @IsInt() companyID?: number;
  @IsOptional() @IsInt() branchesID?: number;
  @IsOptional() @IsInt() manageEmployeeID?: number;

  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() reimbursementType?: string; // optional (you can keep header-level type if needed)
  @IsOptional() @IsString() amount?: string;            // optional
  @IsOptional() @IsString() description?: string;       // optional
  @IsOptional() @IsString() status?: string;

  // 🔽 NEW: line items
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReimbursementItemDto)
  items?: CreateReimbursementItemDto[];
}
