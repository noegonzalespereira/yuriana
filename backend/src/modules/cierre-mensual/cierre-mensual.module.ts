import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierreMensualService } from './cierre-mensual.service';
import { CierreMensualController } from './cierre-mensual.controller';
import { CierreMensual } from './entities/cierre-mensual.entity';
import { DocumentoModule } from '../documento/documento.module';

@Module({
  imports: [TypeOrmModule.forFeature([CierreMensual]), DocumentoModule],
  controllers: [CierreMensualController],
  providers: [CierreMensualService],
})
export class CierreMensualModule {}
