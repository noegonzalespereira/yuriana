import { Module } from '@nestjs/common';
import { GastoServicioService } from './gasto-servicio.service';
import { GastoServicioController } from './gasto-servicio.controller';

@Module({
  controllers: [GastoServicioController],
  providers: [GastoServicioService],
})
export class GastoServicioModule {}
