import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RequisitoDocumentoService } from './requisito-documento.service';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';

@Controller('requisito-documento')
export class RequisitoDocumentoController {
  constructor(private readonly requisitoDocumentoService: RequisitoDocumentoService) {}

  @Post()
  create(@Body() createRequisitoDocumentoDto: CreateRequisitoDocumentoDto) {
    return this.requisitoDocumentoService.create(createRequisitoDocumentoDto);
  }

  @Get()
  findAll() {
    return this.requisitoDocumentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requisitoDocumentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto) {
    return this.requisitoDocumentoService.update(+id, updateRequisitoDocumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requisitoDocumentoService.remove(+id);
  }
}
