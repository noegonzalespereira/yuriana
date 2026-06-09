import { Module } from '@nestjs/common';
import { IngresoExtraService } from './ingreso-extra.service';
import { IngresoExtraController } from './ingreso-extra.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { IngresoExtra } from './entities/ingreso-extra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([IngresoExtra, Empresa]),
    ],
  
  controllers: [IngresoExtraController],
  providers: [IngresoExtraService],
})
export class IngresoExtraModule {}
