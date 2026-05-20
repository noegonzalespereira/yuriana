import { Module } from '@nestjs/common';
import { FacturacionService } from './facturacion.service';
import { FacturacionController } from './facturacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/facturacion.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';
@Module({
  imports: [TypeOrmModule.forFeature([Factura]), CloudinaryModule],
  controllers: [FacturacionController],
  providers: [FacturacionService],
  exports: [FacturacionService]
})
export class FacturacionModule {}
