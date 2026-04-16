import { Test, TestingModule } from '@nestjs/testing';
import { GastoAdministrativoController } from './gasto-administrativo.controller';
import { GastoAdministrativoService } from './gasto-administrativo.service';

describe('GastoAdministrativoController', () => {
  let controller: GastoAdministrativoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastoAdministrativoController],
      providers: [GastoAdministrativoService],
    }).compile();

    controller = module.get<GastoAdministrativoController>(GastoAdministrativoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
