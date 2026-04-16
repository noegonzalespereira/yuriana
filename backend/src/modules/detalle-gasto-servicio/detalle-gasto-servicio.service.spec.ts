import { Test, TestingModule } from '@nestjs/testing';
import { DetalleGastoServicioService } from './detalle-gasto-servicio.service';

describe('DetalleGastoServicioService', () => {
  let service: DetalleGastoServicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleGastoServicioService],
    }).compile();

    service = module.get<DetalleGastoServicioService>(DetalleGastoServicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
