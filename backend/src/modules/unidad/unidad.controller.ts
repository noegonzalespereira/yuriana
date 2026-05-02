import { Controller, Get, Post, Body, Patch,Request, UseGuards,Param, Delete, Query } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterUnidadDto } from './dto/filter-unidad.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('unidad')
export class UnidadController {
  constructor(private readonly unidadService: UnidadService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUnidadDto: CreateUnidadDto, @Request() req){
    return this.unidadService.create(createUnidadDto,req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterUnidadDto){
    return this.unidadService.findAll(filters);
  }

  @Get(':placa')
  findOne(@Param('placa') placa: string) {
    return this.unidadService.findOne(placa);
  }

  @Patch(':placa')
  @Roles('ADMIN')
  update(@Param('placa') placa: string, @Body() updateUnidadDto: UpdateUnidadDto, @Request() req){
    return this.unidadService.update(placa, updateUnidadDto, req.user.id);
  }

  @Delete(':placa')
  @Roles('ADMIN')
  remove(@Param('placa') placa: string, @Request() req){
    return this.unidadService.remove(placa, req.user.id);
  }
}
