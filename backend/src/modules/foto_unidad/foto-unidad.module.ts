import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotoUnidad } from './entities/foto-unidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FotoUnidad]) // Registra la entidad en la base de datos
  ],
  controllers: [], 
  providers: [],   
  exports: [TypeOrmModule] 
})
export class FotoUnidadModule {}