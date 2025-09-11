import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ManageEmployeeService } from './manage-employee.service';
import { CreateManageEmployeeDto } from './dto/create-manage-employee.dto';
import { UpdateManageEmployeeDto } from './dto/update-manage-employee.dto';

@Controller('manage-emp')
export class ManageEmployeeController {
  constructor(private readonly service: ManageEmployeeService) {}

  @Post()
  create(@Body() dto: CreateManageEmployeeDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateManageEmployeeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
