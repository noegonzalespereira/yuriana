import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { EmbarqueService } from './embarque.service';
import { CreateEmbarqueDto } from './dto/create-embarque.dto';
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

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateEmbarqueDto, @Request() req) {
    return this.embarqueService.create(dto, req.user.id);
  }
}