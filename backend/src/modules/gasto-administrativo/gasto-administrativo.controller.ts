import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GastoAdministrativoService } from './gasto-administrativo.service';
import { CreateGastoAdministrativoDto } from './dto/create-gasto-administrativo.dto';
import { UpdateGastoAdministrativoDto } from './dto/update-gasto-administrativo.dto';

@Controller('gasto-administrativo')
export class GastoAdministrativoController {
  constructor(private readonly gastoAdministrativoService: GastoAdministrativoService) {}

  @Post()
  create(@Body() createGastoAdministrativoDto: CreateGastoAdministrativoDto) {
    return this.gastoAdministrativoService.create(createGastoAdministrativoDto);
  }

  @Get()
  findAll() {
    return this.gastoAdministrativoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoAdministrativoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoAdministrativoDto: UpdateGastoAdministrativoDto) {
    return this.gastoAdministrativoService.update(+id, updateGastoAdministrativoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoAdministrativoService.remove(+id);
  }
}
