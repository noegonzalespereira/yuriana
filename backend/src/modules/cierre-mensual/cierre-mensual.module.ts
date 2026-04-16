import { Module } from '@nestjs/common';
import { CierreMensualService } from './cierre-mensual.service';
import { CierreMensualController } from './cierre-mensual.controller';

@Module({
  controllers: [CierreMensualController],
  providers: [CierreMensualService],
})
export class CierreMensualModule {}
