import { Test, TestingModule } from '@nestjs/testing';
import { GastoOperativoService } from './gasto-operativo.service';

describe('GastoOperativoService', () => {
  let service: GastoOperativoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastoOperativoService],
    }).compile();

    service = module.get<GastoOperativoService>(GastoOperativoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
