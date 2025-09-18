import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CalenderService {
  constructor(private prisma: PrismaService) {}

  // Get a paginated list of calendar days, optionally filtered by month/year
  async listDays(year = 2025, month?: number, skip = 0, take = 100) {
    const where: Prisma.CalendarDayWhereInput = { year };
    if (month) where.month = month;

    return this.prisma.calendarDay.findMany({
      where,
      skip,
      take,
      include: { holidayOnDays: { include: { holiday: true } } },
      orderBy: [{ month: 'asc' }, { day: 'asc' }]
    });
  }

  async getDayByDate(year: number, month: number, day: number) {
    const iso = new Date(Date.UTC(year, month-1, day)).toISOString();
    return this.prisma.calendarDay.findUnique({
      where: { isoDate: iso },
      include: { holidayOnDays: { include: { holiday: true } } }
    });
  }

  async listHolidays(region?: string, year = 2025) {
    // find holidays linked to calendar days in a given year and optional region
    const days = await this.prisma.calendarDay.findMany({
      where: { year },
      include: { holidayOnDays: { include: { holiday: true } } }
    });
    // flatten unique holidays
    const map = new Map<number, any>();
    for (const d of days) {
      for (const hd of d.holidayOnDays) {
        if (region && hd.holiday.region && !hd.holiday.region.includes(region)) continue;
        map.set(hd.holiday.id, hd.holiday);
      }
    }
    return Array.from(map.values());
  }

  // Optional: endpoint to run seed (call carefully in dev only)
  async runSeedScript() {
    // This method could import and run the prisma/seed.ts logic, or you can invoke seed via npm script.
    // Keeping simple: return a note.
    return { ok: true, message: "Run seed via prisma/seed.ts (use ts-node) or implement logic here." };
  }
}
