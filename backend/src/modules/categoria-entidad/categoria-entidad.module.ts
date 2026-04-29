import { Module } from '@nestjs/common';
import { CategoriaEntidadService } from './categoria-entidad.service';
import { CategoriaEntidadController } from './categoria-entidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriaEntidad } from './entities/categoria-entidad.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([CategoriaEntidad]),
  ],
  controllers: [CategoriaEntidadController],
  providers: [CategoriaEntidadService],
  exports: [CategoriaEntidadService],
})
export class CategoriaEntidadModule {}
