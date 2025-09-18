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
import { AttendancePolicyModule } from './attendance-policy/attendance-policy.module';
import { LeavePolicyModule } from './leave-policy/leave-policy.module';
import { ManageHolidayModule } from './manage-holiday/manage-holiday.module';
import { PublicHolidayModule } from './public-holiday/public-holiday.module';
import { LeaveApplicationRequestModule } from './leave-application-request/leave-application-request.module';
import { LeaveApplicationModule } from './leave-application/leave-application.module';
import { FilesModule } from './files/files.module';
import { DevicesModule } from './devices/devices.module';
import { ManageEmployeeModule } from './manage-employee/manage-employee.module';
import { EmpCurrentPositionModule } from './emp-current-position/emp-current-position.module';
import { PromotionRequestModule } from './promotion-request/promotion-request.module';
import { EmpPromotionModule } from './emp-promotion/emp-promotion.module';
import { EmpFieldSiteAttendanceModule } from './emp-field-site-attendance/emp-field-site-attendance.module';
import { EmpAttendanceRegulariseModule } from './emp-attendance-regularise/emp-attendance-regularise.module';
import { SalaryCycleModule } from './salary-cycle/salary-cycle.module';
import { SalaryAllowanceModule } from './salary-allowance/salary-allowance.module';
import { SalaryDeductionModule } from './salary-deduction/salary-deduction.module';
import { MonthlyPayGradeModule } from './monthly-pay-grade/monthly-pay-grade.module';
import { HourlyGradeModule } from './hourly-grade/hourly-grade.module';
import { BonusSetupModule } from './bonus-setup/bonus-setup.module';
import { BonousAllocationModule } from './bonous-allocation/bonous-allocation.module';
import { WorkShiftModule } from './work-shift/work-shift.module';
import { AttlogListenerModule } from './attlog-listener/attlog-listener.module';
import { EmpAttendanceSyncModule } from './emp-attendance-sync/emp-attendance-sync.module';
import { TestListenerModule } from './test-listener/test-listener.module';

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
    AttendancePolicyModule,
    LeavePolicyModule,
    ManageHolidayModule,
    PublicHolidayModule,
    LeaveApplicationRequestModule,
    LeaveApplicationModule,
    FilesModule,
    DevicesModule,
    ManageEmployeeModule,
    EmpCurrentPositionModule,
    PromotionRequestModule,
    EmpPromotionModule,
    EmpFieldSiteAttendanceModule,
    EmpAttendanceRegulariseModule,
    SalaryCycleModule,
    SalaryAllowanceModule,
    SalaryDeductionModule,
    MonthlyPayGradeModule,
    HourlyGradeModule,
    BonusSetupModule,
    BonousAllocationModule,
    WorkShiftModule,
    AttlogListenerModule,
    EmpAttendanceSyncModule,
    TestListenerModule,
  ],
})
export class AppModule {}
