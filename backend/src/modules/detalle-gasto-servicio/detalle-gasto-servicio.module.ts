import { Module } from '@nestjs/common';
import { DetalleGastoServicioService } from './detalle-gasto-servicio.service';
import { DetalleGastoServicioController } from './detalle-gasto-servicio.controller';

@Module({
  controllers: [DetalleGastoServicioController],
  providers: [DetalleGastoServicioService],
})
export class DetalleGastoServicioModule {}
