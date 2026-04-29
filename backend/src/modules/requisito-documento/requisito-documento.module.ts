import { Module } from '@nestjs/common';
import { RequisitoDocumentoService } from './requisito-documento.service';
import { RequisitoDocumentoController } from './requisito-documento.controller';
import { CategoriaEntidadModule } from '../categoria-entidad/categoria-entidad.module';
import { RequisitoDocumento } from './entities/requisito-documento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequisitoDocumento]),
    CategoriaEntidadModule,
    
  ],
  controllers: [RequisitoDocumentoController],
  providers: [RequisitoDocumentoService],
  exports: [RequisitoDocumentoService]
})
export class RequisitoDocumentoModule {}
