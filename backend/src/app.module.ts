import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { CompanyModule } from './company/company.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { DesignationsModule } from './designations/designations.module';
import { BankDetailsModule } from './bank-details/bank-details.module';
import { ContractorsModule } from './contractors/contractors.module';
import { WorkShiftModule } from './work-shift/work-shift.module';
import { AttendancePolicyModule } from './attendance-policy/attendance-policy.module';
import { ManageHolidayModule } from './manage-holiday/manage-holiday.module';
import { PublicHolidayModule } from './public-holiday/public-holiday.module';
import { LeaveApplicationRequestModule } from './leave-application-request/leave-application-request.module';
import { FilesModule } from './files/files.module';
import { DevicesModule } from './devices/devices.module';
import { ManageEmployeeModule } from './manage-employee/manage-employee.module';
import { EmpCurrentPositionModule } from './emp-current-position/emp-current-position.module';
import { PromotionRequestModule } from './promotion-request/promotion-request.module';
import { EmpPromotionModule } from './emp-promotion/emp-promotion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // files accessible via /uploads/*
    }),
    ServiceProviderModule,
    CompanyModule,
    BranchesModule,
    DepartmentsModule,
    DesignationsModule,
    BankDetailsModule,
    ContractorsModule,
    WorkShiftModule,
    AttendancePolicyModule,
    ManageHolidayModule,
    PublicHolidayModule,
    LeaveApplicationRequestModule,
    FilesModule,
    DevicesModule,
    ManageEmployeeModule,
    EmpCurrentPositionModule,
    PromotionRequestModule,
    EmpPromotionModule,
  ],
})
export class AppModule {}
