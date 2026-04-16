import { Module } from '@nestjs/common';
import { GastoAdministrativoService } from './gasto-administrativo.service';
import { GastoAdministrativoController } from './gasto-administrativo.controller';

@Module({
  controllers: [GastoAdministrativoController],
  providers: [GastoAdministrativoService],
})
export class GastoAdministrativoModule {}
