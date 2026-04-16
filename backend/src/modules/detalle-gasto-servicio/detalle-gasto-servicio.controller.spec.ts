import { Test, TestingModule } from '@nestjs/testing';
import { DetalleGastoServicioController } from './detalle-gasto-servicio.controller';
import { DetalleGastoServicioService } from './detalle-gasto-servicio.service';

describe('DetalleGastoServicioController', () => {
  let controller: DetalleGastoServicioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleGastoServicioController],
      providers: [DetalleGastoServicioService],
    }).compile();

    controller = module.get<DetalleGastoServicioController>(DetalleGastoServicioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
