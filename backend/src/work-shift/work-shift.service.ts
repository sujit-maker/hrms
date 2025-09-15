import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';

@Injectable()
export class WorkShiftService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateWorkShiftDto) {
    const { workShiftDays, ...workShiftData } = data;
    
    return this.prisma.workShift.create({
      data: {
        ...workShiftData,
        workShiftDay: workShiftDays ? {
          create: workShiftDays.map(day => ({
            weekDay: day.weekDay,
            weeklyOff: day.weeklyOff,
            startTime: day.startTime,
            endTime: day.endTime,
            totalMinutes: day.totalMinutes,
          }))
        } : undefined,
      },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  findAll() {
    return this.prisma.workShift.findMany({
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.workShift.findUnique({
      where: { id },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  update(id: number, data: UpdateWorkShiftDto) {
    const { workShiftDays, ...workShiftData } = data;
    
    return this.prisma.workShift.update({
      where: { id },
      data: {
        ...workShiftData,
        workShiftDay: workShiftDays ? {
          deleteMany: {}, // Delete existing workShiftDay records
          create: workShiftDays.map(day => ({
            weekDay: day.weekDay,
            weeklyOff: day.weeklyOff,
            startTime: day.startTime,
            endTime: day.endTime,
            totalMinutes: day.totalMinutes,
          }))
        } : undefined,
      },
      include: {
        branches: true,
        company: true,
        serviceProvider: true,
        workShiftDay: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // First delete all related WorkShiftDay records
      await prisma.workShiftDay.deleteMany({
        where: { workShiftID: id }
      });
      
      // Then delete the WorkShift record
      return prisma.workShift.delete({ where: { id } });
    });
  }
}