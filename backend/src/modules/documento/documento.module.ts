import { Module } from '@nestjs/common';
import { DocumentoService } from './documento.service';
import { DocumentoController } from './documento.controller';
import { RequisitoDocumentoModule } from '../requisito-documento/requisito-documento.module';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { Documento } from './entities/documento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Documento]),
    CloudinaryModule,
    RequisitoDocumentoModule,
  ],
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [DocumentoService],
})
export class DocumentoModule {}
