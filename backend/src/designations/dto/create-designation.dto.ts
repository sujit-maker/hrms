import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateDesignationsDto {
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
  designantion?: string; // typo preserved from schema
}
