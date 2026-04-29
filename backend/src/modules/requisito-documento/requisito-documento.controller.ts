import { Controller, Get, Post, Body, Patch, Param, Delete,Request, UseGuards, ParseIntPipe, Query} from '@nestjs/common';
import { RequisitoDocumentoService } from './requisito-documento.service';
import { CreateRequisitoDocumentoDto } from './dto/create-requisito-documento.dto';
import { UpdateRequisitoDocumentoDto } from './dto/update-requisito-documento.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterRequisitoDocumentoDto } from './dto/filter-requisito-documento.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('requisito-documento')
export class RequisitoDocumentoController {
  constructor(private readonly requisitoDocumentoService: RequisitoDocumentoService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createRequisitoDocumentoDto: CreateRequisitoDocumentoDto, @Request() req) {
    return this.requisitoDocumentoService.create(createRequisitoDocumentoDto, req.user.id);
  }

  @Get()
  findAll(@Query () filters: FilterRequisitoDocumentoDto) {
    return this.requisitoDocumentoService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requisitoDocumentoService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRequisitoDocumentoDto: UpdateRequisitoDocumentoDto, @Request() req) {
    return this.requisitoDocumentoService.update(id, updateRequisitoDocumentoDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.requisitoDocumentoService.remove(id, req.user.id);
  }
}
