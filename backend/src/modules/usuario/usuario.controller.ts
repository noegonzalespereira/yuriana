import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    return this.usuarioService.create(createUsuarioDto, req.user.id);
  }

  @Get('contador')
  contador() {
    return this.usuarioService.contador();
  }

  @Get()
  findAll(@Query() filters: FilterUsuarioDto) {
    return this.usuarioService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req) {
    return this.usuarioService.update(id, updateUsuarioDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usuarioService.remove(id, req.user.id);
  }
}
