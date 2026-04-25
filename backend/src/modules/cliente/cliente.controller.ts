import { Controller, Get, Post, Body,UseGuards, Patch,Query, Param, Delete, Request, ParseIntPipe } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterClienteDto } from './dto/filter-cliente.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createClienteDto: CreateClienteDto, @Request() req) {
    return this.clienteService.create(createClienteDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterClienteDto) {
    return this.clienteService.findAll(filters);
  }

  @Get(':codigo_cliente')
  findOne(@Param('codigo_cliente') codigo_cliente: string) {
    return this.clienteService.findOne(codigo_cliente);
  }

  @Patch(':codigo_cliente')
  @Roles('ADMIN')
  update(@Param('codigo_cliente') codigo_cliente: string, @Body() updateClienteDto: UpdateClienteDto , @Request() req) {
    return this.clienteService.update(codigo_cliente, updateClienteDto, req.user.id);
  }

  @Delete(':codigo_cliente')
  @Roles('ADMIN')
  remove(@Param('codigo_cliente') codigo_cliente: string, @Request() req) {
    return this.clienteService.remove(codigo_cliente, req.user.id);
  }
}
