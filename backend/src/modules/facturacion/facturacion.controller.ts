import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { CreateFacturacionDto } from './dto/create-facturacion.dto';
import { UpdateFacturacionDto } from './dto/update-facturacion.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturacion')
export class FacturacionController {
  constructor(private readonly facturacionService: FacturacionService) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('foto_factura'))
  create(
    @Body() dto: CreateFacturacionDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.facturacionService.create(dto, file, req.user.id);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.facturacionService.findAll(filters);
  }

  @Get('totales')
  getTotales(@Query() filters: any) {
    return this.facturacionService.getTotales(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturacionService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'foto_factura', maxCount: 1 },
    { name: 'fotos_nuevas', maxCount: 10 },
  ]))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFacturacionDto,
    @UploadedFiles() files: { foto_factura?: Express.Multer.File[]; fotos_nuevas?: Express.Multer.File[] },
    @Request() req,
  ) {
    return this.facturacionService.update(id, dto, files, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.facturacionService.remove(id, req.user.id);
  }
}

