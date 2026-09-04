import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { FilterServicioDto } from './dto/filter-servicio.dto';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servicio')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto_factura', maxCount: 10 },
    { name: 'facturas_fotos', maxCount: 50 },
    { name: 'documentacion_aduanera', maxCount: 10 },
    { name: 'vaucher', maxCount: 1 },
  ], { limits: { fileSize: 10 * 1024 * 1024 } }))
  create(
    @Body() dto: CreateServicioDto,
    @UploadedFiles() files: { foto_factura?: Express.Multer.File[], facturas_fotos?: Express.Multer.File[], documentacion_aduanera?: Express.Multer.File[], vaucher?: Express.Multer.File[] },
    @Request() req
  ) {
    return this.servicioService.create(dto, files, req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterServicioDto) {
    return this.servicioService.findAll(filters);
  }

  @Get('contadores')
  getContadores(
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
  ) {
    return this.servicioService.contador({ fecha_inicio, fecha_fin });
  }

  @Get('totales-pagos')
  totalesPagos(
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.servicioService.totalesPagos(mes, anio ? parseInt(anio) : undefined);
  }

  @Get('recientes')
  findRecientes() {
    return this.servicioService.findRecientes(10);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto_factura', maxCount: 10 },
    { name: 'facturas_fotos', maxCount: 50 },
    { name: 'documentacion_aduanera', maxCount: 10 },
    { name: 'vaucher', maxCount: 1 },
  ], { limits: { fileSize: 10 * 1024 * 1024 } }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioDto,
    @UploadedFiles() files: { foto_factura?: Express.Multer.File[], facturas_fotos?: Express.Multer.File[], documentacion_aduanera?: Express.Multer.File[], vaucher?: Express.Multer.File[] },
    @Request() req
  ) {
    return this.servicioService.update(id, dto, files, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.servicioService.remove(id, req.user.id);
  }

}