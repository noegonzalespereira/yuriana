import { Test, TestingModule } from '@nestjs/testing';
import { IngresoExtraController } from './ingreso-extra.controller';
import { IngresoExtraService } from './ingreso-extra.service';

describe('IngresoExtraController', () => {
  let controller: IngresoExtraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngresoExtraController],
      providers: [IngresoExtraService],
    }).compile();

    controller = module.get<IngresoExtraController>(IngresoExtraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
