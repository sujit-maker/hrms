import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SalaryCycleService } from './salary-cycle.service';
import { CreateSalaryCycleDto } from './dto/create-salary-cycle.dto';
import { UpdateSalaryCycleDto } from './dto/update-salary-cycle.dto';

@Controller('salary-cycle')
export class SalaryCycleController {
  constructor(private readonly service: SalaryCycleService) {}

  @Post()
  create(@Body() dto: CreateSalaryCycleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaryCycleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
