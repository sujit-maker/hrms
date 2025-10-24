import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpAttendanceLogsService {
  constructor(private prisma: PrismaService) {}

  findAll(params?: { skip?: number; take?: number }) {
    const { skip, take } = params || {};
    return this.prisma.empAttendanceLogs.findMany({
      skip,
      take,
      orderBy: { id: 'asc' },
    });
  }
}
