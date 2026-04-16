import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { CreateFacturacionDto } from './dto/create-facturacion.dto';
import { UpdateFacturacionDto } from './dto/update-facturacion.dto';

@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Post()
  create(@Body() createFacturacionDto: CreateFacturacionDto) {
    return this.facturacionService.create(createFacturacionDto);
  }

  @Get()
  findAll() {
    return this.facturacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacturacionDto: UpdateFacturacionDto) {
    return this.facturacionService.update(+id, updateFacturacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturacionService.remove(+id);
  }
}
