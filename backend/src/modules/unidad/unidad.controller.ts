import { Controller, Get, Post, Body, Patch, Request, UseGuards, Param, Delete, Query, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UnidadService } from './unidad.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterUnidadDto } from './dto/filter-unidad.dto';
import { memoryStorage } from 'multer';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('unidad')
export class UnidadController {
  constructor(private readonly unidadService: UnidadService) {}

  @Post('registrar')
  @Roles('ADMIN')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async registrar(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const allFiles = files || [];
    const fotosFiles = allFiles.filter(f => f.fieldname === 'fotos');
    const docFiles = allFiles.filter(f => f.fieldname.startsWith('archivo_'));

    const fechas: Record<number, string> = {};
    Object.keys(body).forEach((key: string) => {
      if (key.startsWith('fecha_')) {
        fechas[parseInt(key.replace('fecha_', ''))] = body[key];
      }
    });

    const anioRegistrar = parseInt(body.anio);
    const currentYearRegistrar = new Date().getFullYear();
    if (isNaN(anioRegistrar) || anioRegistrar < 1990 || anioRegistrar > currentYearRegistrar) {
      throw new BadRequestException(`El año debe estar entre 1990 y ${currentYearRegistrar}`);
    }

    const createUnidadDto: CreateUnidadDto = {
      placa: body.placa,
      id_categoria: parseInt(body.id_categoria),
      num_chasis: body.num_chasis,
      marca: body.marca,
      color: body.color,
      anio: anioRegistrar,
      modelo: body.modelo,
      estado_unidad: body.estado_unidad,
      num_poliza: body.num_poliza,
    };

    return this.unidadService.registrarConDocumentos(createUnidadDto, fotosFiles, docFiles, fechas, req.user.id);
  }

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('fotos', 10, { storage: memoryStorage() }))
  create(@Body() createUnidadDto: CreateUnidadDto, @UploadedFiles() files: Express.Multer.File[],@Request() req){
    return this.unidadService.create(createUnidadDto,files,req.user.id);
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
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  update(
    @Param('placa') placa: string,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    const fotosFiles = (files || []).filter(f => f.fieldname === 'fotos');

    const fotosEliminarIds: number[] = body.fotos_eliminar
      ? body.fotos_eliminar.split(',').map((id: string) => parseInt(id.trim())).filter(Boolean)
      : [];

    if (body.anio !== undefined) {
      const anioUpdate = parseInt(body.anio);
      const currentYearUpdate = new Date().getFullYear();
      if (isNaN(anioUpdate) || anioUpdate < 1990 || anioUpdate > currentYearUpdate) {
        throw new BadRequestException(`El año debe estar entre 1990 y ${currentYearUpdate}`);
      }
    }

    const updateUnidadDto: UpdateUnidadDto = {
      ...(body.num_chasis !== undefined && { num_chasis: body.num_chasis }),
      ...(body.marca !== undefined && { marca: body.marca }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.anio !== undefined && { anio: parseInt(body.anio) }),
      ...(body.modelo !== undefined && { modelo: body.modelo }),
      ...(body.estado_unidad !== undefined && { estado_unidad: body.estado_unidad }),
      ...(body.id_categoria !== undefined && { id_categoria: parseInt(body.id_categoria) }),
      ...(body.num_poliza !== undefined && { num_poliza: body.num_poliza }),
    };

    return this.unidadService.update(placa, updateUnidadDto, fotosFiles, req.user.id, fotosEliminarIds);
  }

  @Delete(':placa')
  @Roles('ADMIN')
  remove(@Param('placa') placa: string, @Request() req){
    return this.unidadService.remove(placa, req.user.id);
  }
}
