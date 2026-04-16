import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GastoGeneralService } from './gasto-general.service';
import { CreateGastoGeneralDto } from './dto/create-gasto-general.dto';
import { UpdateGastoGeneralDto } from './dto/update-gasto-general.dto';

@Controller('gasto-general')
export class GastoGeneralController {
  constructor(private readonly gastoGeneralService: GastoGeneralService) {}

  @Post()
  create(@Body() createGastoGeneralDto: CreateGastoGeneralDto) {
    return this.gastoGeneralService.create(createGastoGeneralDto);
  }

  @Get()
  findAll() {
    return this.gastoGeneralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastoGeneralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGastoGeneralDto: UpdateGastoGeneralDto) {
    return this.gastoGeneralService.update(+id, updateGastoGeneralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gastoGeneralService.remove(+id);
  }
}
