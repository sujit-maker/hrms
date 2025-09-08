import { Module } from '@nestjs/common';
import { LeavePolicyService } from './leave-policy.service';
import { LeavePolicyController } from './leave-policy.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LeavePolicyController],
  providers: [LeavePolicyService, PrismaService],
})
export class LeavePolicyModule {}
