import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriaEntidadService } from './categoria-entidad.service';
import { CreateCategoriaEntidadDto } from './dto/create-categoria-entidad.dto';
import { UpdateCategoriaEntidadDto } from './dto/update-categoria-entidad.dto';

@Controller('categoria-entidad')
export class CategoriaEntidadController {
  constructor(private readonly categoriaEntidadService: CategoriaEntidadService) {}

  @Post()
  create(@Body() createCategoriaEntidadDto: CreateCategoriaEntidadDto) {
    return this.categoriaEntidadService.create(createCategoriaEntidadDto);
  }

  @Get()
  findAll() {
    return this.categoriaEntidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaEntidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaEntidadDto: UpdateCategoriaEntidadDto) {
    return this.categoriaEntidadService.update(+id, updateCategoriaEntidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaEntidadService.remove(+id);
  }
}
