import { Module } from '@nestjs/common';
import { IngresoExtraService } from './ingreso-extra.service';
import { IngresoExtraController } from './ingreso-extra.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { IngresoExtra } from './entities/ingreso-extra.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([IngresoExtra]),
    ],
  
  controllers: [IngresoExtraController],
  providers: [IngresoExtraService],
})
export class IngresoExtraModule {}
