import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { EmbarqueService } from './embarque.service';
import { CreateEmbarqueDto } from './dto/create-embarque.dto';
import { UpdateEmbarqueDto } from './dto/update-embarque.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('embarque')
export class EmbarqueController {
  constructor(private readonly embarqueService: EmbarqueService) {}

  @Get('disponibles')
  findDisponibles(@Query('buscar') buscar?: string) {
    return this.embarqueService.findDisponibles(buscar);
  }

  @Get()
  @Roles('ADMIN')
  findAll(@Query('buscar') buscar?: string) {
    return this.embarqueService.findAll(buscar);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmbarqueDto, @Request() req) {
    return this.embarqueService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.embarqueService.remove(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateEmbarqueDto, @Request() req) {
    return this.embarqueService.create(dto, req.user.id);
  }
}