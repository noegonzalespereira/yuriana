import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
import { AsignacionModule } from '../asignacion/asignacion.module';
import { ClienteModule } from '../cliente/cliente.module';
import { ColaboradorModule } from '../colaborador/colaborador.module';
import { FacturacionModule } from '../facturacion/facturacion.module';
import { DocumentoModule } from '../documento/documento.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Servicio]),
    CloudinaryModule,AsignacionModule, ClienteModule, ColaboradorModule, FacturacionModule, DocumentoModule
  ],
  controllers: [ServicioController],
  providers: [ServicioService],
  exports: [ServicioService],
})
export class ServicioModule {}
