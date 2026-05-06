import { Controller, Get, Post, Body, Param,ParseIntPipe, Delete,UseGuards, Request, Query} from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { FilterAsignacionDto } from './dto/filter-asignacion.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles} from '../../common/decorators/roles.decorator';
@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('asignacion')
export class AsignacionController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createAsignacionDto: CreateAsignacionDto, @Request() req){
    return this.asignacionService.create(createAsignacionDto, req.user.id );
  }

  @Get()
  findAll(@Query() filters: FilterAsignacionDto) {
    return this.asignacionService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id:number) {
    return this.asignacionService.findOne(id);
  }

 
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id:number, @Request() req){
    return this.asignacionService.remove(id, req.user.id);
  }
}
