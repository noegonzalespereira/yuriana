import { Controller, Get, UseGuards, Post, Body, Patch,Request, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { FilterPersonaDto } from './dto/filter-persona.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createPersonaDto: CreatePersonaDto, @Request() req) {
    return this.personaService.create(createPersonaDto, req.user.id);
  }

  @Get()
  findAll(@Query() filters: FilterPersonaDto) {
    return this.personaService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePersonaDto: UpdatePersonaDto, @Request() req) {
    return this.personaService.update(id, updatePersonaDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.personaService.remove(id, req.user.id);
  }
}
