import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { LeaveApplicationService } from './leave-application.service';
import { CreateLeaveApplicationDto } from './dto/create-leave-application.dto';
import { UpdateLeaveApplicationDto } from './dto/update-leave-application.dto';

@Controller('leave-application')
export class LeaveApplicationController {
  constructor(private readonly leaveApplicationService: LeaveApplicationService) {}

  @Post()
  create(@Body() createLeaveApplicationDto: CreateLeaveApplicationDto) {
    return this.leaveApplicationService.create(createLeaveApplicationDto);
  }

  @Get()
  findAll() {
    return this.leaveApplicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leaveApplicationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveApplicationDto: UpdateLeaveApplicationDto,
  ) {
    return this.leaveApplicationService.update(id, updateLeaveApplicationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leaveApplicationService.remove(id);
  }
}
