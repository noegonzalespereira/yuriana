import { Module } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { AsignacionController } from './asignacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { ConductorModule } from '../conductor/conductor.module';
import { UnidadModule } from '../unidad/unidad.module';
import { DocumentoModule } from '../documento/documento.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Asignacion]),
    ConductorModule,
    UnidadModule,
    DocumentoModule
  ],
  controllers: [AsignacionController],
  providers: [AsignacionService],
  exports: [AsignacionService]
})
export class AsignacionModule {}
