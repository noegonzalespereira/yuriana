import { Test, TestingModule } from '@nestjs/testing';
import { IngresoExtraService } from './ingreso-extra.service';

describe('IngresoExtraService', () => {
  let service: IngresoExtraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngresoExtraService],
    }).compile();

    service = module.get<IngresoExtraService>(IngresoExtraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
