import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CierreMensualService } from './cierre-mensual.service';
import { CreateCierreMensualDto } from './dto/create-cierre-mensual.dto';
import { UpdateCierreMensualDto } from './dto/update-cierre-mensual.dto';

@Controller('cierre-mensual')
export class CierreMensualController {
  constructor(private readonly cierreMensualService: CierreMensualService) {}

  @Post()
  create(@Body() createCierreMensualDto: CreateCierreMensualDto) {
    return this.cierreMensualService.create(createCierreMensualDto);
  }

  @Get()
  findAll() {
    return this.cierreMensualService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cierreMensualService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCierreMensualDto: UpdateCierreMensualDto) {
    return this.cierreMensualService.update(+id, updateCierreMensualDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cierreMensualService.remove(+id);
  }
}
