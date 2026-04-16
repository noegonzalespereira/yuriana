import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GastoOperativoService } from './gasto-operativo.service';
import { CreateGastoOperativoDto } from './dto/create-gasto-operativo.dto';
import { UpdateGastoOperativoDto } from './dto/update-gasto-operativo.dto';

@Controller('gasto-operativo')
export class GastoOperativoController {
  constructor(private readonly gastoOperativoService: GastoOperativoService) {}

  @Post()
  create(@Body() createGastoOperativoDto: CreateGastoOperativoDto) {
    return this.gastoOperativoService.create(createGastoOperativoDto);
  }

  @Get()
  findAll() {
    return this.gastoOperativoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoOperativoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoOperativoDto: UpdateGastoOperativoDto) {
    return this.gastoOperativoService.update(+id, updateGastoOperativoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoOperativoService.remove(+id);
  }
}
