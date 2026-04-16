import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleGastoServicioService } from './detalle-gasto-servicio.service';
import { CreateDetalleGastoServicioDto } from './dto/create-detalle-gasto-servicio.dto';
import { UpdateDetalleGastoServicioDto } from './dto/update-detalle-gasto-servicio.dto';

@Controller('detalle-gasto-servicio')
export class DetalleGastoServicioController {
  constructor(private readonly detalleGastoServicioService: DetalleGastoServicioService) {}

  @Post()
  create(@Body() createDetalleGastoServicioDto: CreateDetalleGastoServicioDto) {
    return this.detalleGastoServicioService.create(createDetalleGastoServicioDto);
  }

  @Get()
  findAll() {
    return this.detalleGastoServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleGastoServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleGastoServicioDto: UpdateDetalleGastoServicioDto) {
    return this.detalleGastoServicioService.update(+id, updateDetalleGastoServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleGastoServicioService.remove(+id);
  }
}
