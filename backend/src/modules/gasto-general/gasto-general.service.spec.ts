import { Test, TestingModule } from '@nestjs/testing';
import { GastoGeneralService } from './gasto-general.service';

describe('GastoGeneralService', () => {
  let service: GastoGeneralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GastoGeneralService],
    }).compile();

    service = module.get<GastoGeneralService>(GastoGeneralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
