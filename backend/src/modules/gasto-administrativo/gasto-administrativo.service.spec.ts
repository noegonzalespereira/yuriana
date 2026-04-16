import { Test, TestingModule } from '@nestjs/testing';
import { GastoAdministrativoService } from './gasto-administrativo.service';

describe('GastoAdministrativoService', () => {
  let service: GastoAdministrativoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastoAdministrativoService],
    }).compile();

    service = module.get<GastoAdministrativoService>(GastoAdministrativoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
