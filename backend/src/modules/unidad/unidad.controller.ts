import { Controller, Get, Post, Body, Patch,Request, UseGuards,Param, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterUnidadDto } from './dto/filter-unidad.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('unidad')
export class UnidadController {
  constructor(private readonly unidadService: UnidadService) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('fotos', 10))
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
  @UseInterceptors(FilesInterceptor('fotos', 10))
  update(@Param('placa') placa: string, @Body() updateUnidadDto: UpdateUnidadDto,  @UploadedFiles() files: Express.Multer.File[], @Request() req){
    console.log('Body RAW recibido en controller:', updateUnidadDto);
    console.log('Files recibidos:', files?.length || 0);
    const fotosEliminarRaw = updateUnidadDto.fotos_eliminar;
    const fotosEliminarIds: number[] = fotosEliminarRaw
      ? fotosEliminarRaw.split(',').map((id) => parseInt(id.trim())).filter(Boolean)
    : [];

    console.log('Fotos a eliminar:', fotosEliminarIds);
      
    return this.unidadService.update(placa, updateUnidadDto,files || [], req.user.id, fotosEliminarIds);
  }

  @Delete(':placa')
  @Roles('ADMIN')
  remove(@Param('placa') placa: string, @Request() req){
    return this.unidadService.remove(placa, req.user.id);
  }
}
