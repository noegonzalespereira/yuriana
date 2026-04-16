import { Test, TestingModule } from '@nestjs/testing';
import { GastoGeneralController } from './gasto-general.controller';
import { GastoGeneralService } from './gasto-general.service';

describe('GastoGeneralController', () => {
  let controller: GastoGeneralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastoGeneralController],
      providers: [GastoGeneralService],
    }).compile();

    controller = module.get<GastoGeneralController>(GastoGeneralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
