import { Controller, Get, Post, Body,UseGuards,Query, Patch, Param,Request, Delete, ParseIntPipe } from '@nestjs/common';
import { ColaboradorService } from './colaborador.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('colaborador')
export class ColaboradorController {
  constructor(private readonly colaboradorService: ColaboradorService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createColaboradorDto: CreateColaboradorDto, @Request() req){
    return this.colaboradorService.create(createColaboradorDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterColaboradorDto) {
    return this.colaboradorService.findAll(filters);
  }

  @Get(':ci')
  findOne(@Param('ci', ParseIntPipe) ci: number) {
    return this.colaboradorService.findOne(ci);
  }

  @Patch(':ci')
  @Roles('ADMIN')
  update(@Param('ci', ParseIntPipe) ci: number, @Body() updateColaboradorDto: UpdateColaboradorDto, @Request() req){
    return this.colaboradorService.update(ci, updateColaboradorDto, req.user.id);
  }

  @Delete(':ci')
  @Roles('ADMIN')
  remove(@Param('ci', ParseIntPipe) ci: number, @Request() req){
    return this.colaboradorService.remove(ci, req.user.id);
  }
}
