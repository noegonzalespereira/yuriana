import { Controller, Get, UseGuards,Query, Request,Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { CreateConductorDto } from './dto/create-conductor.dto';
import { UpdateConductorDto } from './dto/update-conductor.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
import { FilterConductorDto } from './dto/filter-conductor.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conductor')
export class ConductorController {
  constructor(private readonly conductorService: ConductorService) {}

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
