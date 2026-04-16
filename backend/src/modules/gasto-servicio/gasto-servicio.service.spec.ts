import { Test, TestingModule } from '@nestjs/testing';
import { GastoServicioService } from './gasto-servicio.service';

describe('GastoServicioService', () => {
  let service: GastoServicioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastoServicioService],
    }).compile();

    service = module.get<GastoServicioService>(GastoServicioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
