import { Module } from '@nestjs/common';
import { GastoGeneralService } from './gasto-general.service';
import { GastoGeneralController } from './gasto-general.controller';

@Module({
  controllers: [GastoGeneralController],
  providers: [GastoGeneralService],
})
export class GastoGeneralModule {}
