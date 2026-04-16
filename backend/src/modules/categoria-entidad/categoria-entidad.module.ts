import { Module } from '@nestjs/common';
import { CategoriaEntidadService } from './categoria-entidad.service';
import { CategoriaEntidadController } from './categoria-entidad.controller';

@Module({
  controllers: [CategoriaEntidadController],
  providers: [CategoriaEntidadService],
})
export class CategoriaEntidadModule {}
