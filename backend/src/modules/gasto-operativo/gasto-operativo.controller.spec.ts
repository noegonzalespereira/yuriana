import { Test, TestingModule } from '@nestjs/testing';
import { GastoOperativoController } from './gasto-operativo.controller';
import { GastoOperativoService } from './gasto-operativo.service';

describe('GastoOperativoController', () => {
  let controller: GastoOperativoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastoOperativoController],
      providers: [GastoOperativoService],
    }).compile();

    controller = module.get<GastoOperativoController>(GastoOperativoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
