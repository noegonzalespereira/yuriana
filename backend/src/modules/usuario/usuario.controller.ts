import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query, ForbiddenException} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { ROL } from '../../common/constants/roles';
@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles(ROL.ADMIN)
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Request() req) {
    return this.usuarioService.create(createUsuarioDto, req.user.id);
  }

  @Get('contador')
  @Roles(ROL.ADMIN)
  contador() {
    return this.usuarioService.contador();
  }

  @Get()
  @Roles(ROL.ADMIN)
  findAll(@Query() filters: FilterUsuarioDto) {
    return this.usuarioService.findAll(filters);
  }

  // Sin @Roles: cualquier usuario autenticado puede consultar, pero solo
  // ADMIN puede ver a otros; el resto solo puede ver su propio usuario.
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.rol !== ROL.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('No tiene permiso para ver este usuario');
    }
    return this.usuarioService.findOne(id);
  }

  // Sin @Roles: ADMIN puede editar a cualquiera; el resto solo su propio
  // usuario, y sin poder tocar su rol/estado (lo filtra el service).
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto, @Request() req) {
    if (req.user.rol !== ROL.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('No tiene permiso para editar este usuario');
    }
    return this.usuarioService.update(id, updateUsuarioDto, req.user.id, req.user.rol === ROL.ADMIN);
  }

  @Delete(':id')
  @Roles(ROL.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usuarioService.remove(id, req.user.id);
  }
}
