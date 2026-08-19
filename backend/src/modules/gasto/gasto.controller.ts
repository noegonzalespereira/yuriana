import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GastosService } from './gasto.service';
import { CreateGastoBulkDto, TipoPestaña } from './dto/create-gasto-bulk.dto';
import { FilterGastoDto } from './dto/filter-gasto.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gastos')
export class GastoController {
  constructor(private readonly gastosService: GastosService) {}

  @Post('guardar-pantalla')
  @Roles('ADMIN')
  async guardarPantallaCompleta(
    @Body() dto: CreateGastoBulkDto,
    @Request() req
  ) {
    return this.gastosService.procesarGastoPantalla(dto, req.user.id);
  }

  @Get('anios-disponibles')
  async obtenerAniosDisponibles() {
    return this.gastosService.obtenerAniosDisponibles();
  }

  @Get('totales-paneles')
  async obtenerTotalesPaneles(
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
    @Query('buscar') buscar?: string,
    @Query('tipo_gasto') tipo_gasto?: string,
  ) {
    return this.gastosService.obtenerTotalesInformativos({
      mes,
      anio: anio ? parseInt(anio, 10) : undefined,
      fecha_inicio,
      fecha_fin,
      buscar,
      tipo_gasto,
    });
  }

  @Get('listado/:pestana')
  async obtenerListadoPestaña(
    @Param('pestana') pestana: TipoPestaña,
    @Query() filters: FilterGastoDto
  ) {
    return this.gastosService.obtenerRegistros(pestana, filters);
  }

  @Get('detalle/:pestana/:id')
  async obtenerDetalleUnico(
    @Param('pestana') pestana: TipoPestaña,
    @Param('id') id: string
  ) {
    return this.gastosService.findOne(pestana, +id);
  }

  @Patch('editar/:pestana/:id')
  @Roles('ADMIN')
  async editarRegistroGasto(
    @Param('pestana') pestana: TipoPestaña,
    @Param('id') id: string,
    @Body() datosModificados: any,
    @Request() req
  ) {
    return this.gastosService.update(pestana, +id, datosModificados, req.user.id);
  }

  @Delete('eliminar/:pestana/:id')
  @Roles('ADMIN')
  async eliminarRegistroGasto(
    @Param('pestana') pestana: TipoPestaña,
    @Param('id') id: string,
    @Request() req
  ) {
    return this.gastosService.remove(pestana, +id, req.user.id);
  }
}