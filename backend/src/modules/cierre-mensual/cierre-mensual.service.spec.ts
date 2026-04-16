import { Test, TestingModule } from '@nestjs/testing';
import { CierreMensualService } from './cierre-mensual.service';

describe('CierreMensualService', () => {
  let service: CierreMensualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CierreMensualService],
    }).compile();

    service = module.get<CierreMensualService>(CierreMensualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
