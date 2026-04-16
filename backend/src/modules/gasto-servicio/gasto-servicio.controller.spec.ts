import { Test, TestingModule } from '@nestjs/testing';
import { GastoServicioController } from './gasto-servicio.controller';
import { GastoServicioService } from './gasto-servicio.service';

describe('GastoServicioController', () => {
  let controller: GastoServicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastoServicioController],
      providers: [GastoServicioService],
    }).compile();

    controller = module.get<GastoServicioController>(GastoServicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
