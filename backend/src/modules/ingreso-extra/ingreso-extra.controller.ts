import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngresoExtraService } from './ingreso-extra.service';
import { CreateIngresoExtraDto } from './dto/create-ingreso-extra.dto';
import { UpdateIngresoExtraDto } from './dto/update-ingreso-extra.dto';

@Controller('ingreso-extra')
export class IngresoExtraController {
  constructor(private readonly ingresoExtraService: IngresoExtraService) {}

  @Post()
  create(@Body() createIngresoExtraDto: CreateIngresoExtraDto) {
    return this.ingresoExtraService.create(createIngresoExtraDto);
  }

  @Get()
  findAll() {
    return this.ingresoExtraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ingresoExtraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngresoExtraDto: UpdateIngresoExtraDto) {
    return this.ingresoExtraService.update(+id, updateIngresoExtraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingresoExtraService.remove(+id);
  }
}
