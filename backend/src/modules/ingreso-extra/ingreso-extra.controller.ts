import { Controller, Get, Post, Body, Patch, ParseIntPipe, Request, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { IngresoExtraService } from './ingreso-extra.service';
import { CreateIngresoExtraDto } from './dto/create-ingreso-extra.dto';
import { UpdateIngresoExtraDto } from './dto/update-ingreso-extra.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ingreso-extra')
export class IngresoExtraController {
  constructor(private readonly ingresoExtraService: IngresoExtraService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createIngresoExtraDto: CreateIngresoExtraDto, @Request() req) {
    return this.ingresoExtraService.create(createIngresoExtraDto, req.user.id);
  }

  @Get('totales')
  getTotales() {
    return this.ingresoExtraService.getTotales();
  }

  @Get()
  findAll(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.ingresoExtraService.findAll({ fecha_inicio, fecha_fin });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingresoExtraService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIngresoExtraDto: UpdateIngresoExtraDto, @Request() req) {
    return this.ingresoExtraService.update(id, updateIngresoExtraDto,req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ingresoExtraService.remove(id, req.user.id);
  }
}
