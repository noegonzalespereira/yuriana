import { Test, TestingModule } from '@nestjs/testing';
import { ServicioController } from './servicio.controller';
import { ServicioService } from './servicio.service';

describe('ServicioController', () => {
  let controller: ServicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicioController],
      providers: [ServicioService],
    }).compile();

    controller = module.get<ServicioController>(ServicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
