import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GastoController } from './gasto.controller';
import { GastosService } from './gasto.service';

// Entidades centralizadas
import { Gasto } from './entities/gasto.entity';
import { GastosServicio } from './entities/gasto-servicio.entity';
import { DetalleGastoServicio } from './entities/detalle-gasto-servicio.entity';
import { GastoOperativo } from './entities/gasto-operativo.entity';
import { GastoAdministrativo } from './entities/gasto-administrativo.entity';
import { GastoGeneral } from './entities/gasto-general.entity';

// Módulos externos necesarios para validaciones cruzadas
import { ServicioModule } from '../servicio/servicio.module';
import { UnidadModule } from '../unidad/unidad.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gasto,
      GastosServicio,
      DetalleGastoServicio,
      GastoOperativo,
      GastoAdministrativo,
      GastoGeneral
    ]),
    ServicioModule, 
    UnidadModule,   
  ],
  controllers: [GastoController],
  providers: [GastosService],
  exports: [GastosService]
})
export class GastoModule {}