import { Module } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { UnidadController } from './unidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEntidadModule } from '../categoria-entidad/categoria-entidad.module';
import { DocumentoModule } from '../documento/documento.module';
import { Unidad } from './entities/unidad.entity';

@Module({
  imports:[ TypeOrmModule.forFeature([Unidad]), 
  CategoriaEntidadModule,DocumentoModule
  ],
  controllers: [UnidadController],
  providers: [UnidadService],
  exports: [UnidadService],
})
export class UnidadModule {}
