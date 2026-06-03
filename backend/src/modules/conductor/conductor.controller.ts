import { Controller, Get, UseGuards, Query, Request, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterConductorDto } from './dto/filter-conductor.dto';
import { memoryStorage } from 'multer';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conductor')
export class ConductorController {
  constructor(private readonly conductorService: ConductorService) {}

  @Post('registrar')
  @Roles('ADMIN')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async registrar(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    const datosConductor: CreateConductorDto = {
      ci: parseInt(body.ci),
      nombre: body.nombre,
      correo: body.correo,
      ciudad: body.ciudad,
      telefono: parseInt(body.telefono),
      telefono2: body.telefono2 ? parseInt(body.telefono2) : undefined,
      sueldo: body.sueldo ? parseFloat(body.sueldo) : undefined,
      estado_operativo: body.estado_operativo,
      estado_laboral: body.estado_laboral,
    };

    const fechas: Record<number, string> = {};
    Object.keys(body).forEach(key => {
      if (key.startsWith('fecha_')) {
        fechas[parseInt(key.replace('fecha_', ''))] = body[key];
      }
    });

    return this.conductorService.registrarConDocumentos(datosConductor, files || [], fechas, req.user.id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createConductorDto: CreateConductorDto, @Request() req) {
    return this.conductorService.create(createConductorDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterConductorDto) {
    return this.conductorService.findAll(filters);
  }

  @Get('contador')
  contador() {
    return this.conductorService.contador();
  }


  @Get(':ci')
  findOne(@Param('ci', ParseIntPipe) ci: number) {
    return this.conductorService.findOne(ci);
  }

  @Patch(':ci')
  @Roles('ADMIN')
  update(@Param('ci', ParseIntPipe) ci: number, @Body() updateConductorDto: UpdateConductorDto, @Request() req) {
    return this.conductorService.update(ci, updateConductorDto, req.user.id);
  }

  @Delete(':ci')
  @Roles('ADMIN')
  remove(@Param('ci', ParseIntPipe) ci: number, @Request() req) {
    return this.conductorService.remove(ci, req.user.id);
  }
}
