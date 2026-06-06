import { Module } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/facturacion.entity';
import { FotoFactura } from './entities/foto-factura.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
@Module({
  imports: [TypeOrmModule.forFeature([Factura, FotoFactura]), CloudinaryModule],
  controllers: [FacturacionController],
  providers: [FacturacionService],
  exports: [FacturacionService]
})
export class FacturacionModule {}
