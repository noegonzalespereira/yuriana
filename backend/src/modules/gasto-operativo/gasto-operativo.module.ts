import { Module } from '@nestjs/common';
import { GastoOperativoService } from './gasto-operativo.service';
import { GastoOperativoController } from './gasto-operativo.controller';

@Module({
  controllers: [GastoOperativoController],
  providers: [GastoOperativoService],
})
export class GastoOperativoModule {}
