import { Module } from '@nestjs/common';
import { ConductorService } from './conductor.service';
import { ConductorController } from './conductor.controller';
import { CategoriaEntidadModule } from '../categoria-entidad/categoria-entidad.module';
import { PersonaModule } from '../persona/persona.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conductor } from './entities/conductor.entity';
import { DocumentoModule } from '../documento/documento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conductor]),
    PersonaModule, CategoriaEntidadModule,DocumentoModule
  ],
  controllers: [ConductorController],
  providers: [ConductorService],
  exports: [ConductorService],
})
export class ConductorModule {}
