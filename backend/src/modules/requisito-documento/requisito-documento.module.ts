import { Module } from '@nestjs/common';
import { RequisitoDocumentoService } from './requisito-documento.service';
import { RequisitoDocumentoController } from './requisito-documento.controller';

@Module({
  controllers: [RequisitoDocumentoController],
  providers: [RequisitoDocumentoService],
})
export class RequisitoDocumentoModule {}
