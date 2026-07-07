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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradorService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateColaboradorDto: UpdateColaboradorDto, @Request() req){
    return this.colaboradorService.update(id, updateColaboradorDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req){
    return this.colaboradorService.remove(id, req.user.id);
  }
}
