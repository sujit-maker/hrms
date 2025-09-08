import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchesDto } from './create-branch.dto';

export class UpdateBranchesDto extends PartialType(CreateBranchesDto) {}
