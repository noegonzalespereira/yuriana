import { Module } from '@nestjs/common';
import { IngresoExtraService } from './ingreso-extra.service';
import { IngresoExtraController } from './ingreso-extra.controller';

@Module({
  controllers: [IngresoExtraController],
  providers: [IngresoExtraService],
})
export class IngresoExtraModule {}
