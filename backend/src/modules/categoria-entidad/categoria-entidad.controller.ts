import { Controller, Get, Post, UseGuards,Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CategoriaEntidadService } from './categoria-entidad.service';
import { CreateCategoriaEntidadDto } from './dto/create-categoria-entidad.dto';
import { UpdateCategoriaEntidadDto } from './dto/update-categoria-entidad.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterCategoriaEntidadDto } from './dto/filter-categoria-entidad.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categoria_entidad')
export class CategoriaEntidadController {
  constructor(private readonly categoriaEntidadService: CategoriaEntidadService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createCategoriaEntidadDto: CreateCategoriaEntidadDto) {
    return this.categoriaEntidadService.create(createCategoriaEntidadDto);
  }

  @Get()
  findAll(@Query() filters: FilterCategoriaEntidadDto) {
    return this.categoriaEntidadService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaEntidadService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoriaEntidadDto: UpdateCategoriaEntidadDto) {
    return this.categoriaEntidadService.update(id, updateCategoriaEntidadDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaEntidadService.remove(id);
  }
}
