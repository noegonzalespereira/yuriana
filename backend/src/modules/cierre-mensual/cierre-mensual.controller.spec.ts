import { Test, TestingModule } from '@nestjs/testing';
import { CierreMensualController } from './cierre-mensual.controller';
import { CierreMensualService } from './cierre-mensual.service';

describe('CierreMensualController', () => {
  let controller: CierreMensualController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CierreMensualController],
      providers: [CierreMensualService],
    }).compile();

    controller = module.get<CierreMensualController>(CierreMensualController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
