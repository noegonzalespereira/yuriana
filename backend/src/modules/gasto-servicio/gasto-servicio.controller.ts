import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GastoServicioService } from './gasto-servicio.service';
import { CreateGastoServicioDto } from './dto/create-gasto-servicio.dto';
import { UpdateGastoServicioDto } from './dto/update-gasto-servicio.dto';

@Controller('gasto-servicio')
export class GastoServicioController {
  constructor(private readonly gastoServicioService: GastoServicioService) {}

  @Post()
  create(@Body() createGastoServicioDto: CreateGastoServicioDto) {
    return this.gastoServicioService.create(createGastoServicioDto);
  }

  @Get()
  findAll() {
    return this.gastoServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoServicioDto: UpdateGastoServicioDto) {
    return this.gastoServicioService.update(+id, updateGastoServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoServicioService.remove(+id);
  }
}
